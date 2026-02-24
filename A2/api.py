from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import jwt
from functools import wraps
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "secret-key")
JWT_ALGORITHM = "HS256"

# Database connection parameters
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "automation_db"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "2606"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432")
}

TABLE_NAME = "ifsc_codes"


def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None


def token_required(f):
   
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Expected format: "Bearer <token>"
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({
                    "error": "Invalid authorization header format",
                    "message": "Use format: Authorization: Bearer <token>"
                }), 401
        
        if not token:
            return jsonify({
                "error": "Authentication token is missing",
                "message": "Please provide a valid JWT token in Authorization header"
            }), 401
        
        try:
            # Verify and decode the token
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            request.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({
                "error": "Token has expired",
                "message": "Please login again to get a new token"
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "error": "Invalid token",
                "message": "The provided token is invalid"
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated


@app.route('/api/login', methods=['POST'])
def login():
    """
   
    
    Request Body (JSON):
        {
            "username": "admin",
            "password": "password"
        }
        
    
    """
    data = request.get_json()
    
    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400
    
    username = data.get('username')
    password = data.get('password')
    
    # Basic auth credentials
    valid_username = os.getenv("API_USERNAME", "admin")
    valid_password = os.getenv("API_PASSWORD", "password")
    
    if username == valid_username and password == valid_password:
        # Generate JWT token
        payload = {
            'user': username,
            'exp': datetime.utcnow() + timedelta(hours=24),  # Token expires in 24 hours
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        return jsonify({
            "success": True,
            "token": token,
            "message": "Login successful"
        }), 200
    else:
        return jsonify({
            "error": "Invalid credentials",
            "message": "Username or password is incorrect"
        }), 401


@app.route('/api/bank-details', methods=['POST'])
@token_required
def get_bank_details():
    """
    
    
    Request Body (JSON):
        {
            "bank_name": "ABHYUDAYA COOPERATIVE BANK LIMITED",
            "ifsc": "ABHY0063001"
        }
        
    Returns:
        JSON object with bank details or error message
    """
    # Get JSON data from request body
    data = request.get_json()
    
    if not data:
        return jsonify({
            "error": "Request body must be JSON",
            "example": {
                "bank_name": "ABHYUDAYA COOPERATIVE BANK LIMITED",
                "ifsc": "ABHY0063001"
            }
        }), 400
    
    bank_name = data.get('bank_name')
    ifsc = data.get('ifsc')
    
    # Validate input
    if not bank_name or not ifsc:
        return jsonify({
            "error": "Both 'bank_name' and 'ifsc' fields are required",
            "example": {
                "bank_name": "ABHYUDAYA COOPERATIVE BANK LIMITED",
                "ifsc": "ABHY0063001"
            }
        }), 400
    
    # Connect to database
    conn = get_db_connection()
    if not conn:
        return jsonify({
            "error": "Database connection failed"
        }), 500
    
    try:
        # Query the database using RealDictCursor to get results as dictionaries
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = f'''
            SELECT * FROM "{TABLE_NAME}"
            WHERE "BANK" = %s AND "IFSC" = %s
        '''
        
        cursor.execute(query, (bank_name, ifsc))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        # Check if record was found
        if result:
            return jsonify({
                "success": True,
                "data": dict(result)
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "No record found for the given bank name and IFSC code"
            }), 404
            
    except Exception as e:
        if conn:
            conn.close()
        return jsonify({
            "error": f"Database query error: {str(e)}"
        }), 500





if __name__ == '__main__':
    print("Starting Bank Details API server...")
    print(f"Database: {DB_CONFIG['dbname']} on {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f"Table: {TABLE_NAME}")
    print("\nAvailable endpoints:")
    print("  POST /api/login            - Get JWT token (username/password)")
    print("  POST /api/bank-details     - Get bank details (requires JWT token)")
    print("\nStarting server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
