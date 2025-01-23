from flask import request, jsonify,Blueprint,render_template,send_from_directory
main = Blueprint('main', __name__)
from models import User,db

@main.route('/')
def home():
   return render_template('index.html') # entry point to vue frontend

@main.route('/register',methods=['POST'])
def register():
   data = request.get_json()
   email = data.get('email')
   password1 = data.get('password1')
   password2 = data.get('password2')
   username = data.get('username')
   role = data.get('role')

   if User.query.filter_by(email=email).first():
      return {"error": "Email already exists"}, 400
   elif password1 != password2:
      return {"error": "Passwords do not match"}, 400

   new_user = User(email=email, password=password1, username=username, role=role)
   db.session.add(new_user)
   db.session.commit()

   return {"message": "User registered successfully", "user_id": new_user.id}, 201




@main.route('/login',methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()

        if user and user.password == password:
            return jsonify({"message": "Login successful", "user_id": user.id, "role": user.role}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({"error": "Invalid method"}), 405  


@main.route('/professional/<id>',methods=['GET'])
def prof_dash():
    pass

@main.route('/professional/<id>/profile',methods=['GET','POST','UPDATE'])
def prof_profile():
   if request.method == 'POST':
      data = request.get_json()
      name = data.get('name')
      contact_no = data.get('contact_no')
      address = data.get('address')
@main.route('/professional/<id>/service',methods=['POST'])
def add_service():
   if request.method == 'POST':
      data = request.get_json()
      name = data.get('name')
      description = data.get('description')

@main.route('/professional/<id>/service/<s_id>',methods=['GET','UPDATE','DELETE'])
def update_service():
   pass

@main.route('/professional/<id>/request',methods=['GET'])
def current_request():
   pass

@main.route('/professional/<id>/request/<r_id>',methods=['GET','UPDATE','DELETE'])
def update_request():
   pass

@main.route('/customer/<id>',methods=['GET'])
def cus_dash():
   pass

@main.route('/customer/<id>/profile',methods=['GET','POST','UPDATE'])
def cus_profile():
   pass

@main.route('/customer/<id>/services',methods=['GET'])
def available_services():
   pass

@main.route('/customer/<id>/service/professionals',methods=['GET'])
def service_professinals():
   pass

@main.route('/customer/<id>/booking',methods=['GET','POST'])
def service_booking():
   pass

@main.route('/customer/<id>/bookings',methods=['GET'])
def get_bookings():
   pass

@main.route('/customer/<id>/booking/<b_id>',methods=['GET','UPDATE','DELETE'])
def update_booking():
   pass
   


#  /admin
# /customer - GET, POST,DELETE,UPDATE
# /professional - GET, POST,DELETE,UPDATE
# /services -  POST,DELETE,UPDATE
# /request - GET
# /login
# /user - GET{payload -success, user_id =?}
# /logout
# GET
# /register
# / -POST
# /user/
#    details/<id>-GET {payload- username, role,email}

# /services
# /  -GET {list of service name}
# /<id> -DELETE,PUT, GET {professional name}
