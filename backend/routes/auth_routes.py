from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from models import db, User
import logging
from datetime import datetime

# Initialize the auth blueprint
auth_routes = Blueprint("auth", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Admin_Register
@auth_routes.route('/register/admin', methods=['POST'])
@jwt_required()  # Ensure only logged-in users can access this
def register_admin():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            logger.warning("JWT identity is missing")
            return jsonify({"error": "Unauthorized"}), 401

        current_user = User.query.get(user_id)
        if not current_user:
            logger.warning(f"User with ID {user_id} not found")
            return jsonify({"error": "User not found"}), 404

        if not current_user.is_admin:
            logger.warning(f"User {current_user.email} attempted unauthorized admin registration")
            return jsonify({"error": "Admin access required"}), 403

        data = request.json
        required_fields = ['username', 'email', 'password', 'confirm_password']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Invalid payload"}), 400

        if data['password'] != data['confirm_password']:
            return jsonify({"error": "Passwords do not match"}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already exists"}), 400

        # Create a new admin user
        admin_user = User(
            username=data['username'],
            email=data['email'],
            is_admin=True  # Set the user as an admin
        )
        admin_user.set_password(data['password'])  # Hash the password
        db.session.add(admin_user)
        db.session.commit()

        logger.info(f"Admin registered successfully: {admin_user.email}")
        return jsonify({"message": "Admin registered successfully"}), 201
    except Exception as e:
        logger.error(f"Error registering admin: {e}")
        db.session.rollback()  # Rollback in case of an error
        return jsonify({"error": "Failed to register admin"}), 500

# SignUp
@auth_routes.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        required_fields = ['username', 'email', 'password', 'confirm_password']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Invalid payload"}), 400
        
        if data['password'] != data['confirm_password']:
            return jsonify({"error": "Passwords do not match"}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already exists"}), 400

        # Create a new user
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])  # Hash the password
        db.session.add(user)
        db.session.commit()

        logger.info(f"User registered successfully: {user.email}")
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to register user"}), 500

# Login
@auth_routes.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        required_fields = ['email', 'password']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Invalid payload"}), 400

        user = User.query.filter_by(email=data['email']).first()
        if user and user.check_password(data['password']):  # Verify password
            token = create_access_token(identity=str(user.id))  # Generate JWT token
            logger.info(f"User logged in successfully: {user.email}")
            return jsonify({"token": token, "is_admin": user.is_admin}), 200

        logger.warning(f"Invalid login attempt for email: {data['email']}")
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        logger.error(f"Error during login: {e}")
        return jsonify({"error": "Failed to log in"}), 500