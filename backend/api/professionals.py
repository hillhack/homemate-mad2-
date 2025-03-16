from flask_restful import Resource
from flask import request, current_app as app
from flask_security import auth_required, current_user
from backend.models import Professional, ProfessionalStats, db
cache = app.cache

class ProfessionalProfile(Resource):
    @auth_required('token')
    @cache.memoize(timeout = 5)
    def get(self, user_id):
        try:
            if current_user.id != user_id:
                return {'message': 'Unauthorized access'}, 403
            professional = Professional.query.filter_by(user_id=user_id).first()
            if not professional:
                return {'message': 'Professional profile not found.'}, 404
            profile_data = {
                'id': professional.id,
                'user_id': professional.user_id,
                'name': professional.name,
                'address': professional.address,
                'contact_no': professional.contact_no,
                'description': professional.description,
                'experience': professional.experience,
                'service_id': professional.service_id
            }
            return profile_data, 200
        except Exception as e:
            return {'message': 'An error occurred.', 'error': str(e)}, 500

    @auth_required('token')
    def put(self, user_id):
        try:
            if current_user.id != user_id:
                return {'message': 'Unauthorized access'}, 403
            professional = Professional.query.filter_by(user_id=user_id).first()
            if not professional:
                return {'message': 'Professional profile not found.'}, 404
            data = request.get_json()
            professional.name = data.get('name', professional.name)
            professional.address = data.get('address', professional.address)
            professional.contact_no = data.get('contact_no', professional.contact_no)
            professional.description = data.get('description', professional.description)
            professional.service_id = data.get("service_id", professional.service_id)
            professional.experience = data.get('experience', professional.experience)

            db.session.commit()
            return {'message': 'Profile updated successfully.'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': 'An error occurred.', 'error': str(e)}, 500

class Professionals(Resource):
    def make_key(self):
        """A function which is called to derive the key for a computed value.
            The key in this case is the concat value of all the json request
            parameters. Other strategy could to use any hashing function.
        :returns: unique string for which the value should be cached.
        """
        service_id = request.args.get('serviceId', type=int) 
        re = f"professional_list_{service_id}"
        print(re)
        return re

    @cache.cached(timeout = 60, make_cache_key=make_key)
    def get(self):
        try:
            service_id = request.args.get('serviceId', type=int)  # Extract service ID from query parameters
            if service_id:

                # Query to get professionals along with their average rating
                query = db.session.query(
                    Professional.id,
                    Professional.user_id,
                    Professional.name,
                    Professional.address,
                    Professional.contact_no,
                    Professional.description,
                    Professional.experience,
                    Professional.service_id,
                    ProfessionalStats.approved_status,
                    ProfessionalStats.average_rating
                ).outerjoin(
                    ProfessionalStats, Professional.id == ProfessionalStats.profile_id
                ).filter(
                    Professional.service_id == service_id
                )

                professionals = query.all()

                # Construct the list of professionals with necessary details
                professional_list = [
                    {
                        'id': p.id,
                        'name': p.name,
                        'contact_no': p.contact_no,
                        'description': p.description,
                        'experience': p.experience,
                        'service_id': p.service_id,
                        'approved_status': p.approved_status,
                        'average_rating': p.average_rating if p.average_rating else 0.0
                    } for p in professionals
                ]

                return professional_list, 200
            else:
                professionals = Professional.query.all()

                professional_list = [
                    {
                        'id': p.id,
                        'name': p.name,
                        'contact_no': p.contact_no,
                        'description': p.description,
                        'experience': p.experience
                    } for p in professionals
                ]
                return professional_list, 200
        except Exception as e:
            return {'message': 'An error occurred.', 'error': str(e)}, 500

    
        
class ProfessionalStatsResource(Resource):
    @cache.memoize(timeout = 5)
    def get(self, user_id):
        professional = Professional.query.filter_by(id=user_id).first()
        professional_stats = ProfessionalStats.query.filter_by(profile_id=user_id).first()

        if not professional_stats:
            return {"message": "Professional stats not found"}, 404
        response = {
            "id": professional_stats.id,
            "name": professional.name,
            'contact_no': professional.contact_no,
            
            "profile_id": professional_stats.profile_id,
            "date_created": professional_stats.date_created.strftime('%Y-%m-%d %H:%M:%S'),
            "approved_status": professional_stats.approved_status,
            "block": professional_stats.block,
            "average_rating": professional_stats.average_rating,
        }
        return response, 200  # ✅ No need for jsonify

    def put(self, user_id):
        professional_stats = ProfessionalStats.query.filter_by(profile_id=user_id).first()
        if not professional_stats:
            return {"message": "Professional stats not found"}, 404
        data = request.json
        if "approved_status" in data:
            professional_stats.approved_status = data["approved_status"]
        if "block" in data:
            professional_stats.block = data["block"]
        try:
            db.session.commit()
            return {"message": "Professional stats updated successfully"}
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500
