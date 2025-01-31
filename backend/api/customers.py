from flask_restful import Resource
from flask import request
from flask_security import auth_required, current_user
from backend.models import Customer, db

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
            customer_list = [{'id': c.id, 'name': c.name, 'contact_no': c.contact_no, 'address': c.address} for c in customers]
            return customer_list, 200
        except Exception as e:
            return {'message': 'An error occurred while fetching customers.', 'error': str(e)}, 500
