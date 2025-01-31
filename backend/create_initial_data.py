from flask import current_app as app
from backend.models import db
from flask_security import SQLAlchemyUserDatastore, hash_password

with app.app_context():
    db.create_all()

    userdatastore: SQLAlchemyUserDatastore = app.security.datastore

    # Creating roles if they do not exist
    userdatastore.find_or_create_role(name='admin', description='superuser')
    userdatastore.find_or_create_role(name='professional', description='service provider')
    userdatastore.find_or_create_role(name='customer', description='want service')

    # Creating users with 'Pending' active status
    if not userdatastore.find_user(email='admin@gmail.com'):
        userdatastore.create_user(email='admin@gmail.com', password=hash_password('pass'), roles=['admin'], active='Pending')

    if not userdatastore.find_user(email='prof1@gmail.com'):
        userdatastore.create_user(email='prof1@gmail.com', password=hash_password('pass'), roles=['professional'], active='Pending')

    if not userdatastore.find_user(email='cus1@gmail.com'):
        userdatastore.create_user(email='cus1@gmail.com', password=hash_password('pass'), roles=['customer'], active='Pending')

    db.session.commit()
