from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db , User, Role
from flask_security import Security, SQLAlchemyUserDatastore, auth_required

def create_app():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')

    app.config.from_object(LocalDevelopmentConfig)


    # model init
    db.init_app(app)
    
    # cache init
    # cache = Cache(app)


    #flask security
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    # app.cache = cache

    app.security = Security(app, datastore=datastore,register_blueprint=False)
    app.app_context().push()

    from backend.api import api
    # flask-restful init
    api.init_app(app)

    return app

app = create_app()

import backend.create_initial_data
import backend.routes

if __name__ == '__main__':
    app.run()