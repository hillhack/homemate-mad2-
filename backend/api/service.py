from datetime import datetime
from flask_restful import Resource
from flask import request , jsonify
from backend.models import Service, db ,ServiceRequest
from flask_security import auth_required, roles_required, current_user  # Flask-Security imports

class ServiceListResource(Resource):
    # This is for /api/services to only handle GET requests (fetch all services)
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
                new_service = Service(name=data.get('name'))
                db.session.add(new_service)
                db.session.commit()
                return {'message': 'Service created successfully', 'id': new_service.id}, 201
            except Exception as e:
                db.session.rollback()
                return {'message': 'Error creating service', 'error': str(e)}, 500

class ServiceResource(Resource):
    # This is for /api/services/<int:service_id> to handle CRUD operations
    @auth_required('token')  # Ensure the user is authenticated
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
    @roles_required('admin')  # Only Admin can add services
    def post(self):
        """
        Admin can add new services.
        """
        try:
            data = request.get_json()
            new_service = Service(name=data['name'], base_price=data['base_price'])
            db.session.add(new_service)
            db.session.commit()
            return {'message': 'Service added successfully'}, 201
        except Exception as e:
            return {'message': 'An error occurred while adding the service.', 'error': str(e)}, 500

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
            else:
                return {"message": "Invalid role. Use 'customer' or 'professional'."}, 400

            return jsonify([{
                "id": req.id,
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
