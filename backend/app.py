from flask import Flask, request, jsonify, session
from flask_cors import CORS
from datetime import timedelta
from models.project_model import get_all_projects, add_project, update_project, delete_project
from models.crop_model import get_all_crops, add_crop, update_crop, delete_crop
from models.platform_model import get_all_platforms, add_platform, update_platform, delete_platform
from models.sensor_model import get_all_sensors, add_sensor, update_sensor, delete_sensor
from models.flight_model import get_all_flights, add_flight, update_flight, delete_flight
from models.productType_model import get_all_product_types, add_product_type, update_product_type, delete_product_type
from models.user_model import get_user_by_email

app = Flask(__name__)
app.secret_key = 'super_secret_key'  # Replace with a secure key
app.permanent_session_lifetime = timedelta(minutes=30)  # Session timeout
CORS(app, supports_credentials=True)  # Enable cross-origin requests with credentials

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')

    user = get_user_by_email(email)
    if user and user['password'] == data.get('password'):
        session['user'] = email  # Store user session
        print("Login Successful")
        return jsonify({'message': 'Login successful', 'user': email}), 200
    else:
        print("Login Unsuccessful")
        return jsonify({'message': 'Invalid email Id or password'}), 401

# Logout route
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)  # Clear the user session
    return jsonify({'message': 'Logged out successfully'}), 200

# Authentication check route
# @app.route('/check-auth', methods=['GET'])
# def check_auth():
#     if 'user' in session:
#         return jsonify({'authenticated': True}), 200
#     return jsonify({'authenticated': False}), 401

projects = []

@app.route('/projects', methods=['POST'])
def create_project():  # Changed name from `add_project` to `create_project`
    data = request.get_json()
    print("Received Data:", data)

    try:
        add_project(data)  # This refers to the function in project_model.py
        return jsonify({'message': 'Project added successfully'}), 201
    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error for debugging
        return jsonify({'error': str(e)}), 500

@app.route('/projects', methods=['GET'])
def get_projects():
    try:
        projects = get_all_projects()
        return jsonify(projects), 200
    except Exception as e:
        print(f"Error fetching projects: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/projects/<int:id>', methods=['PUT'])
def modify_project(id):
    data = request.json
    print("Data : ", data)
    update_project(id, data['name'], data['plantingDate'], data['harvestDate'], data['description'])
    return jsonify({'message': 'Project updated successfully!'})

@app.route('/projects/<int:id>', methods=['DELETE'])
def remove_project(id):
    delete_project(id)
    return jsonify({'message': 'Project deleted successfully!'})

@app.route('/crops', methods=['GET'])
def get_crops():
    try:
        crops = get_all_crops()
        return jsonify(crops), 200
    except Exception as e:
        print(f"Error fetching crops: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/crops', methods=['POST'])
def create_crop():
    data = request.get_json()
    crop_name = data.get('name')
    try:
        add_crop(crop_name)
        return jsonify({'message': f"Crop '{crop_name}' added successfully"}), 201
    except Exception as e:
        print(f"Error adding crop: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/crops/<int:id>', methods=['PUT'])
def modify_crop(id):
    data = request.get_json()
    crop_name = data.get('name')
    try:
        print("Crop ID : ",id,", Crop Name : ", crop_name)
        update_crop(id, crop_name)
        return jsonify({'message': f"Crop updated to '{crop_name}'"}), 200
    except Exception as e:
        print(f"Error updating crop: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/crops/<int:id>', methods=['DELETE'])
def remove_crop(id):
    try:
        delete_crop(id)
        return jsonify({'message': f"Crop with ID {id} deleted"}), 200
    except Exception as e:
        print(f"Error deleting crop: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/platforms', methods=['GET'])
def get_platforms():
    """Fetch all platforms from the database."""
    try:
        platforms = get_all_platforms()
        return jsonify(platforms), 200
    except Exception as e:
        print(f"Error fetching platforms: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/platforms', methods=['POST'])
def create_platform():
    """Add a new platform."""
    data = request.get_json()
    platform_name = data.get('name')
    try:
        add_platform(platform_name)
        return jsonify({'message': f"Platform '{platform_name}' added successfully"}), 201
    except Exception as e:
        print(f"Error adding platform: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/platforms/<int:id>', methods=['PUT'])
def modify_platform(id):
    """Update an existing platform."""
    data = request.get_json()
    platform_name = data.get('name')
    try:
        print(f"Platform ID: {id}, Platform Name: {platform_name}")
        update_platform(id, platform_name)
        return jsonify({'message': f"Platform updated to '{platform_name}'"}), 200
    except Exception as e:
        print(f"Error updating platform: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/platforms/<int:id>', methods=['DELETE'])
def remove_platform(id):
    """Delete a platform."""
    try:
        delete_platform(id)
        return jsonify({'message': f"Platform with ID {id} deleted"}), 200
    except Exception as e:
        print(f"Error deleting platform: {e}")
        return jsonify({'error': str(e)}), 500
    
# Sensor Routes
@app.route('/sensors', methods=['GET'])
def get_sensors():
    try:
        sensors = get_all_sensors()
        return jsonify(sensors), 200
    except Exception as e:
        print(f"Error fetching sensors: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/sensors', methods=['POST'])
def create_sensor():
    data = request.get_json()
    sensor_name = data.get('name')
    try:
        add_sensor(sensor_name)
        return jsonify({'message': f"Sensor '{sensor_name}' added successfully"}), 201
    except Exception as e:
        print(f"Error adding sensor: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/sensors/<int:id>', methods=['PUT'])
def modify_sensor(id):
    data = request.get_json()
    sensor_name = data.get('name')
    try:
        update_sensor(id, sensor_name)
        return jsonify({'message': f"Sensor updated to '{sensor_name}'"}), 200
    except Exception as e:
        print(f"Error updating sensor: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/sensors/<int:id>', methods=['DELETE'])
def remove_sensor(id):
    try:
        delete_sensor(id)
        return jsonify({'message': f"Sensor with ID {id} deleted"}), 200
    except Exception as e:
        print(f"Error deleting sensor: {e}")
        return jsonify({'error': str(e)}), 500
    
flights = []

@app.route('/flights', methods=['POST'])
def create_flight():
    data = request.get_json()
    print("Received Data:", data)

    try:
        add_flight(data)  # This refers to the function in project_model.py
        return jsonify({'message': 'Flight added successfully'}), 201
    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error for debugging
        return jsonify({'error': str(e)}), 500

@app.route('/flights', methods=['GET'])
def get_flights():
    try:
        flights = get_all_flights()
        print("Flights : ", flights)
        return jsonify(flights), 200
    except Exception as e:
        print(f"Error fetching flights: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/flights/<int:id>', methods=['PUT'])
def modify_flight(id):
    data = request.json
    print("Data : ", data)
    update_flight(id, data['name'], data['date'], data['project'], data['platform'], data['sensor'], data['altitude'], data['forward'], data['side'])
    return jsonify({'message': 'Flight updated successfully!'})

@app.route('/flights/<int:id>', methods=['DELETE'])
def remove_flight(id):
    delete_flight(id)
    return jsonify({'message': 'Flight deleted successfully!'})

product_types = []

@app.route('/product-types', methods=['POST'])
def create_product_type():
    data = request.get_json()
    print("Received Data for Product Type:", data)

    try:
        add_product_type(data)  # This refers to the function in project_model.py or a similar module
        return jsonify({'message': 'Product type added successfully'}), 201
    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error for debugging
        return jsonify({'error': str(e)}), 500

@app.route('/product-types', methods=['GET'])
def get_product_types():
    try:
        product_types = get_all_product_types()
        print("Product Types:", product_types)
        return jsonify(product_types), 200
    except Exception as e:
        print(f"Error fetching product types: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/product-types/<int:id>', methods=['PUT'])
def modify_product_type(id):
    data = request.json
    print("Data for Product Type Update:", data)
    update_product_type(id, data['name'], data['type'])
    return jsonify({'message': 'Product type updated successfully!'})

@app.route('/product-types/<int:id>', methods=['DELETE'])
def remove_product_type(id):
    delete_product_type(id)
    return jsonify({'message': 'Product type deleted successfully!'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
