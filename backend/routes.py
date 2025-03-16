from flask import current_app as app, jsonify, render_template, request,send_file
from flask_security import verify_password, hash_password
from backend.models import User, db, Professional, Customer, ProfessionalStats,ServiceRequest
from flask_security import auth_required
from celery.result import AsyncResult
from backend.celery.task import export_service_requests
import os
datastore = app.security.datastore

@app.route('/')
def home():
    return render_template('index.html')

@auth_required('token') 
@app.get('/export')
def createCSV():
    task = export_service_requests.delay()  # Start CSV generation
    return {'task_id': task.id}, 200


@auth_required('token') 
@app.get('/get-csv/<id>')
def getCSV(id):
    result = AsyncResult(id)
    if result.state == "SUCCESS":
        file_path = f'./backend/celery/user-downloads/{result.result}'
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        return jsonify({"message": "File not found"}), 404  # Handle missing file
    
    return jsonify({"status": result.state}), 202  # Task still in progress


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        # Check for missing inputs
        if not email or not password or not role:
            return jsonify({
                "message": "Please fill in all the fields.",
                "category": "warning"
            }), 400

        # Check if user exists
        user = datastore.find_user(email=email)
        if not user:
            return jsonify({
                "message": "Invalid email. No user found with this email.",
                "category": "danger"
            }), 404

        if verify_password(password, user.password):
            # Check professional block status
            professional = Professional.query.filter_by(user_id=user.id).first()
            if professional:
                professional_stats = ProfessionalStats.query.filter_by(profile_id=professional.id).first()
                print( type(professional_stats.block))
                if professional_stats and professional_stats.block == '1':
                    return jsonify({
                        "message": "Your professional account is blocked. Please contact support.",
                        "category": "error"
                    }), 403

            # Check customer block status
            customer = Customer.query.filter_by(user_id=user.id).first()
            if customer and customer.block == '1':
                return jsonify({
                    "message": "Your customer account is blocked. Please contact support.",
                    "category": "error"
                }), 403

            # Check for role mismatch
            if role not in user.roles:
                return jsonify({
                    "message": "Role mismatch. Please select the correct role.",
                    "category": "warning"
                }), 403


            # Successful login
            return jsonify({
                "message": "Login successful! Welcome back.",
                "category": "success",
                "token": user.get_auth_token(),
                "email": user.email,
                "role": role,
                "id": user.id
            }), 200

        # Incorrect password
        return jsonify({
            "message": "Incorrect password. Please try again.",
            "category": "danger"
        }), 400

    except Exception as e:
        return jsonify({
            "message": f"An error occurred: {str(e)}",
            "category": "danger"
        }), 500

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password or role not in ['admin', 'professional', 'customer']:
        return jsonify({"message": "Invalid inputs", "type": "error"}), 400

    existing_user = datastore.find_user(email=email)
    if existing_user and role in existing_user.roles:
        return jsonify({"message": "User with this role already exists", "type": "warning"}), 400
    if existing_user:
        return jsonify({"message": "User already exists", "type": "warning"}), 400

    try:
        user = datastore.create_user(email=email, password=hash_password(password), roles=[role], active=True)
        db.session.commit()

        # Create corresponding profile
        if role == 'professional':
            user_profile = Professional(user_id=user.id)
            db.session.add(user_profile)
            db.session.commit()

            # Create ProfessionalStats entry
            prof_stats = ProfessionalStats(profile_id=user_profile.id)
            db.session.add(prof_stats)

        elif role == 'customer':
            user_profile = Customer(user_id=user.id)
            db.session.add(user_profile)

        db.session.commit()

        return jsonify({"message": "User created successfully", "type": "success"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error occurred: {str(e)}", "type": "error"}), 500

