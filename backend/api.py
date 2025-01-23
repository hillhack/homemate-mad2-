from flask import jsonify, request, current_app as app
from flask_restful import Api, Resource
from flask_security import auth_required, current_user
from backend.models import Professional, Service, Review, Customer, db

api = Api(app, prefix='/api')

class ProfessionalProfile(Resource):
    @auth_required('token')  
    def get(self, user_id):
        try:
            if current_user.id != user_id:
                return {'message': 'Unauthorized access'}, 403  # Forbidden
            professional = Professional.query.filter_by(user_id=user_id).first()
            if not professional:
                return {'message': 'Professional profile not found.'}, 404

            # Prepare the profile data to return
            profile_data = {
                'id': professional.id,
                'user_id': professional.user_id,
                'name': professional.name,
                'address': professional.address,
                'contact_no': professional.contact_no,
                'description': professional.description,
                'experience': professional.experience,
                'service_id' : professional.service_id
            }

            return profile_data, 200  # Ensure returning as JSON

        except Exception as e:
            return {'message': 'An error occurred.', 'error': str(e)}, 500
        
    @auth_required('token')  # Ensure the user is authenticated with a token
    def put(self, user_id):
        """
        Update the professional profile based on the user ID.
        """
        try:
            # Check if the logged-in user is the one requesting the update
            if current_user.id != user_id:
                return {'message': 'Unauthorized access'}, 403  # Forbidden

            # Query the professional profile using the user ID
            professional = Professional.query.filter_by(user_id=user_id).first()

            if not professional:
                return {'message': 'Professional profile not found.'}, 404

            # Get the updated data from the request
            data = request.get_json()
            if not data:
                return {'message': 'No input data provided.'}, 400

            # Update the profile fields
            professional.name = data.get('name', professional.name)
            professional.address = data.get('address', professional.address)
            professional.contact_no = data.get('contact_no', professional.contact_no)
            professional.description = data.get('description', professional.description)
            professional.experience = data.get('experience', professional.experience)

            # Save the changes to the database
            db.session.commit()

            return {'message': 'Profile updated successfully.'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': 'An error occurred.', 'error': str(e)}, 500
   

class ServiceResource(Resource):
    def get(self):
        """
        Fetch all available services.
        """
        try:
            services = Service.query.all()
            service_list = [{'id': service.id, 'name': service.name, 'base_price': service.base_price} for service in services]
            return service_list
        except Exception as e:
            return {'message': 'An error occurred.', 'error': str(e)}, 500
        
    def post(self):
        """
        Add a new service.
        """
        try:
            data = request.get_json()
            new_service = Service(name=data['name'])
            db.session.add(new_service)
            db.session.commit()
            return {'message': 'Service added successfully'}, 201
        except Exception as e:
            return {'message': 'An error occurred while adding the service.', 'error': str(e)}, 500

class OnlyService(Resource):
    def get(self, service_id):
        """
        Fetch details of a specific service.
        """
        try:
            service = Service.query.get(service_id)
            if not service:
                return {'message': 'Service not found.'}, 404

            return {
                'id': service.id,
                'name': service.name,
                'base_price': service.base_price
            }, 200

        except Exception as e:
            return {'message': 'An error occurred.', 'error': str(e)}, 500  
        
    @auth_required('token')
    def put(self, service_id):
        """
        Update a service's details.
        """
        try:
            data = request.get_json()
            if not data:
                return {'message': 'No input data provided.'}, 400

            service = Service.query.get(service_id)
            if not service:
                return {'message': 'Service not found.'}, 404

            # Update fields
            service.name = data.get('name', service.name)
            service.base_price = data.get('base_price', service.base_price)
            db.session.commit()

            return {'message': 'Service updated successfully.'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': 'An error occurred.', 'error': str(e)}, 500

class Professionals(Resource):
    def get(self):
        """
        Get a list of all professionals.
        """
        try:
            # Query all professionals
            professionals = Professional.query.all()

            # Prepare a list of professionals as dictionaries
            professional_list = [
                {
                    'id': professional.id,
                    'name': professional.name,
                    'contact_no': professional.contact_no,
                    'description': professional.description,
                    'experience': professional.experience,
                }
                for professional in professionals
            ]

            return jsonify(professional_list)  # Return the list as JSON

        except Exception as e:
            # Handle errors and rollback if needed
            db.session.rollback()
            return {'message': 'An error occurred while fetching professionals.', 'error': str(e)}, 500

class CustomerProfile(Resource):
    @auth_required('token')
    def get(self, user_id):
        try:
            if current_user.id != user_id:
                return {'message': 'Unauthorized access'}, 403

            customer = Customer.query.filter_by(user_id=user_id).first()
            if not customer:
                return {'message': 'Customer profile not found.'}, 404

            profile_data = {
                'id': customer.id,
                'user_id': customer.user_id,
                'name': customer.name,
                'address': customer.address,
                'contact_no': customer.contact_no
            }

            return profile_data, 200

        except Exception as e:
            return {'message': 'An error occurred.', 'error': str(e)}, 500

    @auth_required('token')
    def put(self, user_id):
        try:
            if current_user.id != user_id:
                return {'message': 'Unauthorized access'}, 403

            customer = Customer.query.filter_by(user_id=user_id).first()
            if not customer:
                return {'message': 'Customer profile not found.'}, 404

            data = request.get_json()
            if not data:
                return {'message': 'No input data provided.'}, 400

            customer.name = data.get('name', customer.name)
            customer.address = data.get('address', customer.address)
            customer.contact_no = data.get('contact_no', customer.contact_no)

            db.session.commit()

            return {'message': 'Profile updated successfully.'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': 'An error occurred.', 'error': str(e)}, 500


class Customers(Resource):
    def get(self):
        try:
            customers = Customer.query.all()
            customer_list = [
                {
                    'id': customer.id,
                    'name': customer.name,
                    'contact_no': customer.contact_no,
                    'address': customer.address,
                    'block': customer.block
                }
                for customer in customers
            ]
            return customer_list, 200

        except Exception as e:
            return {'message': 'An error occurred while fetching customers.', 'error': str(e)}, 500



# Adding the ProfessionalProfileResource to the API with URL parameter for user_id
api.add_resource(ProfessionalProfile, '/professional/profile/<int:user_id>')
api.add_resource(ServiceResource, '/services')
api.add_resource(OnlyService, '/services/<int:Service_id>') 
api.add_resource(Professionals, '/professionals')
api.add_resource(Customers, '/customers')