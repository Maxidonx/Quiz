import os

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///quiz.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default_secret_key_1234567890abcdef")  # Use a default value for now
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY is not set in the environment variables.")

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS_SUPPORTS_CREDENTIALS = True

    # SocketIO
    SOCKET_CORS_ALLOWED_ORIGINS = os.getenv("SOCKET_CORS_ALLOWED_ORIGINS", "*")
    SOCKET_PING_INTERVAL = 10
    SOCKET_PING_TIMEOUT = 5
    SOCKET_RECONNECT = True
    SOCKET_RECONNECT_ATTEMPTS = 3
    SOCKET_TRANSPORT = ["websocket"]

    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Development configuration
class DevelopmentConfig(Config):
    DEBUG = True

# Testing configuration
class TestingConfig(Config):
    TESTING = True

# Production configuration
class ProductionConfig(Config):
    pass

# Get the appropriate config based on the environment
config_name = os.getenv('FLASK_CONFIG', 'DevelopmentConfig')
app_config = globals()[config_name]()