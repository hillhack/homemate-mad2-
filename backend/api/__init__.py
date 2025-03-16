from flask import  current_app as app
from flask_restful import Api
from .professionals import ProfessionalProfile, Professionals,ProfessionalStatsResource
from .customers import CustomerProfile, Customers
from .service import ServiceResource ,ServiceListResource ,ServiceRequestResource 
from .review import ReviewResource

api = Api(app, prefix='/api')


# Add the resources
api.add_resource(ProfessionalProfile, '/professional/profile/<int:user_id>')
api.add_resource(ProfessionalStatsResource, '/professional/stats/<int:user_id>')
api.add_resource(ServiceListResource, '/services')
api.add_resource(ServiceResource, '/services/<int:service_id>')  # Combined route for both actions
api.add_resource(Professionals, '/professionals')
api.add_resource(Customers, '/customers')
api.add_resource(CustomerProfile, '/customer/profile/<int:user_id>')
api.add_resource(ServiceRequestResource,'/requests/<int:profile_id>')
api.add_resource(ReviewResource, '/reviews' )
if __name__ == '__main__':
    app.run(debug=True)
