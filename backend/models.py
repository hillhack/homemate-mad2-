from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()
# Association table for many-to-many relationship
user_roles = db.Table(
    'user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)  # Flask-Security
    active = db.Column(db.String(15), default="Pending")  # String instead of Boolean
    roles = db.relationship('Role', secondary=user_roles, backref=db.backref('users', lazy='dynamic'))  # Many-to-many

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

# Review model for customer feedback
class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # Rating from 1 to 5
    comment = db.Column(db.Text, nullable=True)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    service_request_id = db.Column(db.Integer, db.ForeignKey('service_request.id'), nullable=False)

# Service model for services offered
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    base_price = db.Column(db.Float, nullable=True)  # Changed to Float for numerical calculations
    professionals = db.relationship('Professional', backref='service', lazy=True)

# Professional model for service providers
class Professional(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)  # One-to-One with User
    name = db.Column(db.String(50), nullable=True)
    address = db.Column(db.String(100), nullable=True)
    contact_no = db.Column(db.String(15), nullable=True)
    description = db.Column(db.Text, nullable=True)
    experience = db.Column(db.Integer, nullable=True)  # Number of years of experience
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=True)  # Many-to-One with Service
# ProfessionalStats model for tracking professional's performance
class ProfessionalStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=False)  # One-to-One with Professional
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    approved_status = db.Column(db.String(15), default='Pending')  # Approval status
    block = db.Column(db.String(10), default=False)  # Whether the professional is blocked
    average_rating = db.Column(db.Float, default=0.0)  # Professional's average rating

# Customer model for service request functionality
class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)  # One-to-One with User
    name = db.Column(db.String(100), nullable=True)
    contact_no = db.Column(db.String(15), nullable=True)
    address = db.Column(db.String(200), nullable=True)
    block = db.Column(db.String(10), default=False)  # Whether the customer is blocked

    # One-to-One relationship with User (authentication data)
    user = db.relationship("User", backref="customer")

# ServiceRequest model for tracking service requests by customers
class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)  # Service being requested
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)  # Customer requesting the service
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=False)  # Professional providing the service
    status = db.Column(db.String(50), default='Pending')  # Status of the service request (e.g., Pending, In Progress, Completed)
    request_date = db.Column(db.DateTime, default=datetime.utcnow)  # When the service request was created
    completion_date = db.Column(db.DateTime, nullable=True)  # When the service was completed
    service = db.relationship('Service', backref='requests')
    seen = db.Column(db.Boolean, default=False)#professinal seen it or nt

