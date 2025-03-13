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
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role') 

    if not email or not password or not role:
        return jsonify({"message": "Invalid inputs"}), 400

    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message": "Invalid email"}), 404

    if verify_password(password, user.password):
        # Optionally, check if the selected role matches the role of the user
        if role not in user.roles:
            return jsonify({"message": "Role mismatch"}), 403
        return jsonify({
            'token': user.get_auth_token(),
            'email': user.email,
            'role': role,
            'id': user.id
        }), 200
    return jsonify({'message': 'Incorrect password'}), 400

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password or role not in ['admin', 'professional', 'customer']:
        return jsonify({"message": "Invalid inputs"}), 400

    existing_user = datastore.find_user(email=email)
    if existing_user and role in existing_user.roles:
        return jsonify({"message": "User with this role already exists"}), 400
    if existing_user:
        return jsonify({"message": "User already exists"}), 400

    # Create user
    try:
        user = datastore.create_user(email=email, password=hash_password(password), roles=[role], active=True)
        db.session.commit()

        # Create corresponding profile
        if role == 'professional':
            user_profile = Professional(user_id=user.id)
            db.session.add(user_profile)
            db.session.commit()  # Commit to generate user_profile.id

            # Create ProfessionalStats entry
            prof_stats = ProfessionalStats(profile_id=user_profile.id)
            db.session.add(prof_stats)

        elif role == 'customer':
            user_profile = Customer(user_id=user.id)
            db.session.add(user_profile)

        db.session.commit()
        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error occurred: {str(e)}"}), 500
