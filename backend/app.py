from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from extensions import socketio
from models import db
from config import Config
from routes.auth_routes import auth_routes
from routes.quiz_routes import quiz_routes
from routes.user_routes import user_routes
from routes.user_routes import UPLOAD_FOLDER
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.config['UPLOAD_FOLDER'] = 'static/upload'

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
socketio.init_app(app, cors_allowed_origins="*")

# Register blueprints
app.register_blueprint(auth_routes, url_prefix="/api")
app.register_blueprint(quiz_routes, url_prefix="/api")
app.register_blueprint(user_routes, url_prefix="/api")

# Global error handler
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {e}")
    return jsonify({"error": "An unexpected error occurred"}), 500

# Database initialization
initialized = False

@app.before_request
def initialize_database():
    global initialized
    if not initialized:
        logger.info("Initializing database...")
        db.create_all()
        initialized = True
        
if __name__ == "__main__":
    logger.info("Starting the application...")
    socketio.run(app, debug=True)
