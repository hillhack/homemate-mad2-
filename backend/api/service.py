from datetime import datetime
from flask_restful import Resource
from flask import request , jsonify,current_app as app
from backend.models import Service, db ,ServiceRequest
from flask_security import auth_required, roles_required, current_user  # Flask-Security imports
cache = app.cache

class ServiceListResource(Resource):
    # This is for /api/services to only handle GET requests (fetch all services)
    @cache.cached(timeout = 5, key_prefix = "service_list")
    def get(self):
        try:
            services = Service.query.all()
            service_list = [{'id': service.id, 'name': service.name, 'base_price': service.base_price} for service in services]
            return service_list, 200
        except Exception as e:
            return {'message': 'An error occurred.', 'error': str(e)}, 500
        
    @auth_required('token')
    def post(self):
        """Create a new service."""
        try:
            data = request.get_json()
            name = data.get('name')
            base_price = data.get('base_price')  # Get base_price if provided

            if not name:  # Ensure name is required
                return {'message': 'Service name is required'}, 400

            # Convert base_price to float if provided, else set it to None (NULL in DB)
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
    # This is for /api/services/<int:service_id> to handle CRUD operations
    @auth_required('token')  # Ensure the user is authenticated
    @cache.memoize(timeout = 5)
    def get(self, service_id):
        """
        Get a specific service by its ID. Both Admin and Professional can view.
        """
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'message': 'Service not found.'}, 404
            return {'id': service.id, 'name': service.name, 'base_price': service.base_price}, 200
        except Exception as e:
            return {'message': 'An error occurred.', 'error': str(e)}, 500

    @auth_required('token')
    @roles_required('admin')  # Only Admin can update services
    def put(self, service_id):
        """
        Admin can update services.
        """
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'message': 'Service not found.'}, 404
            data = request.get_json()
            service.name = data.get('name', service.name)
            service.base_price = data.get('base_price', service.base_price)
            db.session.commit()
            return {'message': 'Service updated successfully.'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': 'An error occurred.', 'error': str(e)}, 500

    @auth_required('token')
    @roles_required('admin')  # Only Admin can delete services
    def delete(self, service_id):
        """
        Admin can delete services.
        """
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'message': 'Service not found.'}, 404
            db.session.delete(service)
            db.session.commit()
            return {'message': 'Service deleted successfully.'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': 'An error occurred.', 'error': str(e)}, 500
        
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

            return jsonify([{
                "id": req.id,
                "name" : req.service.name,
                "service_id": req.service_id,
                "customer_id": req.customer_id,
                "professional_id": req.professional_id,
                "status": req.status,
                "request_date": req.request_date,
                "completion_date": req.completion_date
            } for req in service_requests])

        except Exception as e:
            return {"message": "An error occurred.", "error": str(e)}, 500

    def post(self,profile_id):
        """Allow a customer to book a service by creating a new service request."""
        try:
            data = request.get_json()

            service_id = data.get("service_id")
            professional_id = data.get("professional_id")  # The assigned professional
            request_date = datetime.utcnow()

            if not service_id  or not professional_id:
                return {"message": "Missing required fields (service_id, customer_id, professional_id)"}, 400

            new_request = ServiceRequest(
                service_id=service_id,
                customer_id=profile_id,
                professional_id=professional_id,
                request_date=request_date
            )

            db.session.add(new_request)
            db.session.commit()
            return {"message": "Service request created successfully", "id": new_request.id}, 201

        except Exception as e:
            db.session.rollback()
            return {"message": "Error creating service request", "error": str(e)}, 500
        
    
    @auth_required('token')
    def put(self, profile_id):
        """Update the status of a service request by a professional."""
        try:
            data = request.get_json()
            request_id = data.get("request_id")
            new_status = data.get("status")

            if not request_id or not new_status:
                return {"message": "Missing required fields (request_id, status)"}, 400

            service_request = ServiceRequest.query.filter_by(id=request_id, professional_id=profile_id).first()

            if not service_request:
                return {"message": "Service request not found or unauthorized"}, 404

            service_request.status = new_status
            db.session.commit()

            return {"message": f"Service request updated to '{new_status}'"}, 200

        except Exception as e:
            db.session.rollback()
            return {"message": "Error updating service request", "error": str(e)}, 500
