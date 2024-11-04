from flask import Flask, request, jsonify
from flask_cors import CORS
from models.project_model import get_all_projects, add_project, update_project, delete_project
from models.crop_model import get_all_crops, add_crop, update_crop, delete_crop
from models.platform_model import get_all_platforms, add_platform, update_platform, delete_platform
from models.sensor_model import get_all_sensors, add_sensor, update_sensor, delete_sensor


app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
