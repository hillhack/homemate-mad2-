from datetime import datetime
from flask_restful import Resource
from flask import request, jsonify, current_app as app
from backend.models import Service, db, ServiceRequest
from flask_security import auth_required, roles_required, current_user

cache = app.cache

class ServiceListResource(Resource):
    @cache.cached(timeout=5, key_prefix="service_list")
    def get(self):
        """Fetch all available services."""
        try:
            services = Service.query.all()
            service_list = [{'id': s.id, 'name': s.name, 'base_price': s.base_price} for s in services]
            return service_list, 200
        except Exception as e:
            return {'message': 'Error fetching services', 'error': str(e)}, 500

    @auth_required('token')
    def post(self):
        """Create a new service."""
        try:
            data = request.get_json()
            name = data.get('name')
            base_price = data.get('base_price')

            if not name:
                return {'message': 'Service name is required'}, 400

            base_price = float(base_price) if base_price is not None else None

            new_service = Service(name=name, base_price=base_price)
            db.session.add(new_service)
            db.session.commit()

            return {
                'message': 'Service created successfully',
                'id': new_service.id,
                'name': new_service.name,
                'base_price': new_service.base_price
            }, 201

        except ValueError:
            return {'message': 'Invalid base_price format'}, 400
        except Exception as e:
            db.session.rollback()
            return {'message': 'Error creating service', 'error': str(e)}, 500


class ServiceResource(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    def get(self, service_id):
        """Fetch a specific service by ID."""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'message': 'Service not found'}, 404
            return {'id': service.id, 'name': service.name, 'base_price': service.base_price}, 200
        except Exception as e:
            return {'message': 'Error fetching service', 'error': str(e)}, 500

    @auth_required('token')
    @roles_required('admin')
    def put(self, service_id):
        """Admin can update a service."""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'message': 'Service not found'}, 404

            data = request.get_json()
            service.name = data.get('name', service.name)
            service.base_price = data.get('base_price', service.base_price)

            db.session.commit()
            return {'message': 'Service updated successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': 'Error updating service', 'error': str(e)}, 500

    @auth_required('token')
    @roles_required('admin')
    def delete(self, service_id):
        """Admin can delete a service."""
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'message': 'Service not found'}, 404

            db.session.delete(service)
            db.session.commit()
            return {'message': 'Service deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': 'Error deleting service', 'error': str(e)}, 500

class ServiceRequestResource(Resource):
    @auth_required('token')
    @cache.cached(timeout = 5, key_prefix = "prof_service")
    def get(self, profile_id):
        """Fetch all service requests for a particular customer or professional."""
        try:
            role = request.args.get("role")
            if not role:
                return {"message": "Role is required in the request body"}, 400

            if role == "customer":
                service_requests = ServiceRequest.query.filter_by(customer_id=profile_id).all()
            elif role == "professional":
                service_requests = ServiceRequest.query.filter_by(professional_id=profile_id).all()
                for req in service_requests:
                    if not req.seen:
                        req.seen = True
                    db.session.commit()
            else:
                return {"message": "Invalid role. Use 'customer' or 'professional'."}, 400

            status_distribution = {
                "Pending": sum(1 for r in service_requests if r.status == 'Pending'),
                "Accepted": sum(1 for r in service_requests if r.status == 'Accepted'),
                "Completed": sum(1 for r in service_requests if r.status == 'Completed'),
            }

            return jsonify([{
                "id": req.id,
                "name": req.service.name,
                "service_id": req.service_id,
                "customer_id": req.customer_id,
                "professional_id": req.professional_id,
                "status": req.status,
                "request_date": req.request_date,
                "completion_date": req.completion_date,
                "pending": status_distribution.get("Pending", 0),
                "accepted": status_distribution.get("Accepted", 0),
                "completed": status_distribution.get("Completed", 0),
            } for req in service_requests])


        except Exception as e:
            return {"message": "Error fetching service requests", "error": str(e)}, 500




    @auth_required('token')
    def post(self, profile_id):
        """Create a new service request."""
        try:
            data = request.get_json()
            service_id = data.get("service_id")
            professional_id = data.get("professional_id")

            if not service_id or not professional_id:
                return {"message": "Missing required fields (service_id, professional_id)"}, 400

            new_request = ServiceRequest(
                service_id=service_id,
                customer_id=profile_id,
                professional_id=professional_id,
                request_date=datetime.utcnow()
            )

            db.session.add(new_request)
            db.session.commit()

            return {"message": "Service request created", "id": new_request.id}, 201

        except Exception as e:
            db.session.rollback()
            return {"message": "Error creating service request", "error": str(e)}, 500
        
    @auth_required('token')
    def put(self, profile_id):
        """Update the status or completion date of a service request."""
        try:
            data = request.get_json()
            if not data:
                return {"message": "No JSON data provided"}, 400
            role = request.args.get('role') 
            request_id = data.get("request_id")
            new_status = data.get("status")
            completion_date_str = data.get("completion_date")

            if not request_id:
                return {"message": "Missing required field: request_id"}, 400
            # Fetch the existing service request
            if role == "customer":
               service_request = ServiceRequest.query.filter_by(id=request_id, customer_id=profile_id).first() 
            else:
                service_request = ServiceRequest.query.filter_by(id=request_id, professional_id=profile_id).first()
            if not service_request:
                return {"message": "Service request not found or unauthorized"}, 404

            # Update status if provided
            if new_status:
                service_request.status = new_status

            # Update completion_date if provided
            if completion_date_str:
                try:
                    # Handle 'Z' timezone indicator
                    if completion_date_str.endswith('Z'):
                        completion_date_str = completion_date_str[:-1] + '+00:00'
                    completion_date = datetime.fromisoformat(completion_date_str)
                    service_request.completion_date = completion_date
                except ValueError:
                    return {"message": "Invalid completion_date format. Expected ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)."}, 400

            db.session.commit()
            return {"message": "Service request updated successfully"}, 200

        except Exception as e:
            db.session.rollback()
            return {"message": "Error updating service request", "error": str(e)}, 500
