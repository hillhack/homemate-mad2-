from flask import current_app as app, jsonify, render_template,  request, send_file
from flask_security import auth_required, verify_password, hash_password, current_user
from backend.models import User, db , Professional ,Customer

datastore = app.security.datastore

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message" : "invalid inputs"}), 404
    
    user = datastore.find_user(email = email)

    if not user:
        return jsonify({"message" : "invalid email"}), 404
    
    if verify_password(password, user.password):
        return jsonify({'token' : user.get_auth_token(), 'email' : user.email, 'role' : user.roles[0].name, 'id' : user.id})
    
    return jsonify({'message' : 'password wrong'}), 400

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password or role not in ['admin', 'professional','customer']:
        return jsonify({"message" : "invalid inputs"}), 400  # Change to 400 for bad request
    
    user = datastore.find_user(email=email)

    if user:
        return jsonify({"message" : "user already exists"}), 400  # Change to 400 for bad request
    else:
        user = datastore.create_user(email=email, password=hash_password(password), roles=[role], active=True)
        db.session.commit()
        if role == 'professional':
            user_profile = Professional(user_id=user.id)
            db.session.add(user_profile)

        elif role == 'customer':
            user_profile = Customer(user_id=user.id)
            db.session.add(user_profile)

        db.session.commit()
        return jsonify({"message" : "user created"}), 200
