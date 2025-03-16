from flask_restful import Resource
from flask import request, jsonify
from backend.models import Review, db
from flask import current_app as app

class ReviewResource(Resource):
    def post(self):
        """
        Handle the submission of a review.
        """
        data = request.get_json()
        rating = data.get('rating')
        comment = data.get('comment')
        service_request_id = data.get('service_request_id')

        # Validate required fields
        if not all([rating, service_request_id]):
            return {'message': 'Missing required fields'}, 400

        try:
            # Create a new review
            review = Review(
                rating=rating,
                comment=comment,
                service_request_id=service_request_id
            )
            db.session.add(review)
            db.session.commit()

            return {'message': 'Review submitted successfully'}, 201
        except Exception as e:
            db.session.rollback()
            app.logger.error(f'Error submitting review: {str(e)}')
            return {'message': 'An error occurred', 'error': str(e)}, 500

    def get(self):
        """
        Fetch all reviews or filter by professional_id, customer_id, or service_request_id.
        """
        try:
            # Get query parameters for filtering
            service_request_id = request.args.get('request_id', type=int)

            # Build the query
            query = Review.query

            if service_request_id:
                query = query.filter_by(service_request_id=service_request_id)

            # Execute the query
            reviews = query.all()

            # Format the response
            reviews_data = [
                {
                    'id': review.id,
                    'rating': review.rating,
                    'comment': review.comment,
                    'service_request_id': review.service_request_id
                }
                for review in reviews
            ]

            return {'reviews': reviews_data}, 200
        except Exception as e:
            app.logger.error(f'Error fetching reviews: {str(e)}')
            return {'message': 'An error occurred', 'error': str(e)}, 500