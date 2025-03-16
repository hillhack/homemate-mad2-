from datetime import datetime, timedelta
from flask import current_app as app
from backend.models import db, User, Role, Service, Professional, Customer, ServiceRequest, Review, ProfessionalStats
from flask_security import SQLAlchemyUserDatastore, hash_password

with app.app_context():
    db.create_all()

    userdatastore: SQLAlchemyUserDatastore = app.security.datastore

    # Creating roles if they do not exist
    userdatastore.find_or_create_role(name='admin', description='superuser')
    userdatastore.find_or_create_role(name='professional', description='service provider')
    userdatastore.find_or_create_role(name='customer', description='want service')

    # Creating users with 'Pending' active status
    admin_user = userdatastore.find_user(email='admin@gmail.com')
    if not admin_user:
        admin_user = userdatastore.create_user(
            email='admin@gmail.com',
            password=hash_password('pass'),
            roles=['admin'],
        )

    prof1_user = userdatastore.find_user(email='prof1@gmail.com')
    if not prof1_user:
        prof1_user = userdatastore.create_user(
            email='prof1@gmail.com',
            password=hash_password('pass'),
            roles=['professional'],
        )

    prof2_user = userdatastore.find_user(email='prof2@gmail.com')
    if not prof2_user:
        prof2_user = userdatastore.create_user(
            email='prof2@gmail.com',
            password=hash_password('pass'),
            roles=['professional'],
        )

    cus1_user = userdatastore.find_user(email='cus1@gmail.com')
    if not cus1_user:
        cus1_user = userdatastore.create_user(
            email='cus1@gmail.com',
            password=hash_password('pass'),
            roles=['customer'],
        )

    cus2_user = userdatastore.find_user(email='cus2@gmail.com')
    if not cus2_user:
        cus2_user = userdatastore.create_user(
            email='cus2@gmail.com',
            password=hash_password('pass'),
            roles=['customer'],
        )

    db.session.commit()

    # Adding Services with base_price
    services = [
        {'name': 'Plumbing', 'base_price': 50.0},
        {'name': 'Electrical', 'base_price': 60.0},
        {'name': 'Cleaning', 'base_price': 40.0},
        {'name': 'Carpentry', 'base_price': 70.0},
    ]

    for service_data in services:
        if not db.session.query(db.exists().where(Service.name == service_data['name'])).scalar():
            service = Service(**service_data)
            db.session.add(service)

    db.session.commit()

    # Adding Professionals
    professionals = [
        {
            'user_id': prof1_user.id,
            'name': 'John Doe',
            'address': '123 Main St, City',
            'contact_no': '123-456-7890',
            'description': 'Experienced plumber with 10 years of experience.',
            'experience': 10,
            'service_id': db.session.query(Service.id).filter_by(name='Plumbing').first()[0]
        },
        {
            'user_id': prof2_user.id,
            'name': 'Jane Smith',
            'address': '456 Elm St, City',
            'contact_no': '987-654-3210',
            'description': 'Certified electrician with 8 years of experience.',
            'experience': 8,
            'service_id': db.session.query(Service.id).filter_by(name='Electrical').first()[0]
        },
    ]

    for prof_data in professionals:
        if not db.session.query(db.exists().where(Professional.user_id == prof_data['user_id'])).scalar():
            professional = Professional(**prof_data)
            db.session.add(professional)

    db.session.commit()

    # Adding Customers
    customers = [
        {
            'user_id': cus1_user.id,
            'name': 'Alice Johnson',
            'contact_no': '555-123-4567',
            'address': '789 Oak St, City',
            'block': False
        },
        {
            'user_id': cus2_user.id,
            'name': 'Bob Williams',
            'contact_no': '555-987-6543',
            'address': '321 Pine St, City',
            'block': False
        },
    ]

    for cust_data in customers:
        if not db.session.query(db.exists().where(Customer.user_id == cust_data['user_id'])).scalar():
            customer = Customer(**cust_data)
            db.session.add(customer)

    db.session.commit()

    # Adding Service Requests
    service_requests = [
        {
            'service_id': db.session.query(Service.id).filter_by(name='Plumbing').first()[0],
            'customer_id': db.session.query(Customer.id).filter_by(name='Alice Johnson').first()[0],
            'professional_id': db.session.query(Professional.id).filter_by(name='John Doe').first()[0],
            'status': 'Completed',
            'request_date': datetime.utcnow() - timedelta(days=5),
            'completion_date': datetime.utcnow() - timedelta(days=2),
            'seen': True
        },
        {
            'service_id': db.session.query(Service.id).filter_by(name='Electrical').first()[0],
            'customer_id': db.session.query(Customer.id).filter_by(name='Bob Williams').first()[0],
            'professional_id': db.session.query(Professional.id).filter_by(name='Jane Smith').first()[0],
            'status': 'Accepted',
            'request_date': datetime.utcnow() - timedelta(days=3),
            'completion_date': None,
            'seen': False
        },
    ]

    for sr_data in service_requests:
        if not db.session.query(db.exists().where(ServiceRequest.id == sr_data.get('id'))).scalar():
            service_request = ServiceRequest(**sr_data)
            db.session.add(service_request)

    db.session.commit()

    # Adding Reviews
    reviews = [
        {
            'rating': 5,
            'comment': 'Excellent work! Fixed the issue quickly.',
            'service_request_id': db.session.query(ServiceRequest.id).filter_by(status='Completed').first()[0]
        },
        {
            'rating': 4,
            'comment': 'Good service, but a bit expensive.',
            'service_request_id': db.session.query(ServiceRequest.id).filter_by(status='Accepted').first()[0]
        },
    ]

    for review_data in reviews:
        if not db.session.query(db.exists().where(Review.id == review_data.get('id'))).scalar():
            review = Review(**review_data)
            db.session.add(review)

    db.session.commit()

    # Adding Professional Stats
    professional_stats = [
        {
            'profile_id': db.session.query(Professional.id).filter_by(name='John Doe').first()[0],
            'approved_status': 'approved',
            'block': False,
            'average_rating': 4.8
        },
        {
            'profile_id': db.session.query(Professional.id).filter_by(name='Jane Smith').first()[0],
            'approved_status': 'approved',
            'block': False,
            'average_rating': 4.5
        },
    ]

    for stats_data in professional_stats:
        if not db.session.query(db.exists().where(ProfessionalStats.profile_id == stats_data['profile_id'])).scalar():
            stats = ProfessionalStats(**stats_data)
            db.session.add(stats)

    db.session.commit()

    print("Dummy data added successfully!")