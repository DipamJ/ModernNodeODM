import glob
import sys
from models.boundary_model import get_all_boundaries, save_upload_boundary_metadata
from models.chm_model import get_all_chms, save_upload_chm_metadata
from models.orthomosaic_model import get_all_orthomosaics, save_upload_orthomosaic_metadata
from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
from datetime import timedelta
from flask_mail import Mail, Message
from qgis.core import QgsApplication
from qgis.analysis import QgsNativeAlgorithms
from processing.core.Processing import Processing

# --- QGIS Initialization ---
# Set the QGIS prefix path (should match your QGIS installation, e.g. /usr)
QgsApplication.setPrefixPath("/usr", True)
# Create a QgsApplication instance; False means no GUI is used
qgs = QgsApplication([], False)
# qgs.setHomePath("/app") 
qgs.initQgis()

# Initialize the processing framework
Processing.initialize()
# Add the native algorithms provider so that processing algorithms are available
qgs.processingRegistry().addProvider(QgsNativeAlgorithms())
# --- End QGIS Initialization ---

# Now import modules that depend on QGIS processing functionality
from models.project_model import get_all_projects, add_project, update_project, delete_project, get_projects_by_manager, get_project_members_by_manager, update_member_project_status, remove_member_from_project, get_projects_by_manager_email, add_member_to_project, get_projects_for_member, fetch_project_by_id
from models.crop_model import get_all_crops, add_crop, update_crop, delete_crop
from models.platform_model import get_all_platforms, add_platform, update_platform, delete_platform
from models.sensor_model import get_all_sensors, add_sensor, update_sensor, delete_sensor
from models.flight_model import get_all_flights, add_flight, update_flight, delete_flight
from models.productType_model import get_all_product_types, add_product_type, update_product_type, delete_product_type
from models.user_model import get_user_by_email, register_user, get_all_users, update_user_approval, assign_role_to_user, delete_user_by_id
from models.role_model import get_all_roles, add_role, update_role, delete_role
from models.upload_model import save_upload_metadata, get_all_uploads, check_duplicate_upload
import os
from werkzeug.utils import secure_filename
from models.canopy import generate_cc_dat, generate_cc_boundary
import geopandas

app = Flask(__name__)
app.secret_key = 'super_secret_key'  # Replace with a secure key
app.permanent_session_lifetime = timedelta(minutes=30)  # Session timeout
CORS(app, supports_credentials=True)  # Enable cross-origin requests with credentials

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'dipamjyoti47@gmail.com'
app.config['MAIL_PASSWORD'] = 'yghh lvvr vzwv wenj'
mail = Mail(app)

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')

    user = get_user_by_email(email)
    if user and user['password'] == data.get('password'):
        session['user_id'] = user['id_user']
        if user['admin_approved'] != 'Approved':
            return jsonify({'message': 'Your account is not yet approved by the admin.'}), 403
        session['user'] = email  # Store user session
        print("Login Successful")
        return jsonify({
            "user": {
                "id_user": user['id_user'],
                "email": user['email']
            },
            "message": "Login successful"
            }), 200
    else:
        print("Login Unsuccessful")
        return jsonify({'message': 'Invalid email Id or password'}), 401

# Register route
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')

        # Check if the email already exists
        if get_user_by_email(email):
            return jsonify({'message': 'Email already registered'}), 408

        # Create user
        register_user(data)
        sys.stdout.write("User Registered Successfully ! \n")

        admin_email = 'dipam@tamu.edu'  # Replace with the admin's email
        msg = Message(
            subject="New User Registration",
            sender="test@gmail.com",
            recipients=[admin_email],
        )
        link = f"http://localhost:3000/modify-users"
        msg.body = f"""
        A new user has registered with the following details:
        Name: {data['first_name']} {data['last_name']}
        Email: {data['email']}
        
        Approve/ Disapprove the user: {link}
        """
        mail.send(msg)

        return jsonify({'message': 'Registration successful. Please wait for admin approval.'}), 201
    except Exception as e:
        sys.stdout.write(f"Error in registration: {e}")
        return jsonify({'message': 'An error occurred during registration'}), 500
    
@app.route('/register-member', methods=['POST'])
def register_member():
    try:
        data = request.get_json()
        email = data.get('email')
        manager_email = data.get('pmEmail')

        # Check if the email already exists
        if get_user_by_email(email):
            return jsonify({'message': 'Email already registered'}), 408

        # Create user
        user_id = register_user(data)

        project_ids = get_projects_by_manager_email(manager_email)

        if not project_ids:
            return jsonify({'message': 'No projects found for the provided Project Manager email'}), 404

        # # Insert into project_membership table
        for project_id in project_ids:
            add_member_to_project(user_id, project_id)

        # # Send approval emails to project manager
        msg = Message(
            subject="Member Registration Approval Required",
            sender="test@gmail.com",
            recipients=[manager_email],
        )
        link = f"http://localhost:3000/project-access"  # Approval link
        msg.body = f"""
        A new member has requested access to your project(s).
        Name: {data['first_name']} {data['last_name']}
        Email: {data['email']}
        
        Approve/Disapprove the member here: {link}
        """
        mail.send(msg)

        return jsonify({'message': 'Registration successful. Please wait for project manager approval.'}), 201

    except Exception as e:
        print(f"Error in registration: {e}")
        return jsonify({'message': 'An error occurred during registration'}), 500

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
    sys.stdout.write("Received Data:" + str(data) + "\n")

    try:
        add_project(data)  # This refers to the function in project_model.py
        return jsonify({'message': 'Project added successfully'}), 201
    except Exception as e:
        sys.stdout.write(f"Error: {str(e)} \n")  # Log the error for debugging
        return jsonify({'error': str(e)}), 500

@app.route('/projects', methods=['GET'])
def get_projects():
    try:
        projects = get_all_projects()
        return jsonify(projects), 200
    except Exception as e:
        print(f"Error fetching projects: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/projects/<int:id>', methods=['GET'])
def get_project_by_id(id):
    try:
        project = fetch_project_by_id(id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
                
        return jsonify(project)
    except Exception as e:
        print(f"Error fetching project: {str(e)}")
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

@app.route('/roles', methods=['GET'])
def get_roles():
    try:
        roles = get_all_roles()
        return jsonify({'roles': roles}), 200
    except Exception as e:
        print(f"Error fetching roles: {e}")
        return jsonify({'error': 'Failed to fetch roles'}), 500

@app.route('/roles', methods=['POST'])
def create_role():
    data = request.get_json()
    role_name = data.get('name')
    if not role_name:
        return jsonify({'message': 'Role name is required'}), 400
    try:
        add_role(role_name)
        return jsonify({'message': 'Role added successfully'}), 201
    except Exception as e:
        print(f"Error adding role: {e}")
        return jsonify({'error': 'Failed to add role'}), 500

@app.route('/roles/<int:role_id>', methods=['PUT'])
def modify_role(role_id):
    data = request.get_json()
    role_name = data.get('name')
    if not role_name:
        return jsonify({'message': 'Role name is required'}), 400
    try:
        update_role(role_id, role_name)
        return jsonify({'message': 'Role updated successfully'}), 200
    except Exception as e:
        print(f"Error updating role: {e}")
        return jsonify({'error': 'Failed to update role'}), 500

@app.route('/roles/<int:role_id>', methods=['DELETE'])
def remove_role(role_id):
    try:
        delete_role(role_id)
        return jsonify({'message': 'Role deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting role: {e}")
        return jsonify({'error': 'Failed to delete role'}), 500
    
# Fetch all users
@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = get_all_users()
        return jsonify({'users': users}), 200
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({'error': str(e)}), 500

# Update approval status
@app.route('/users/<int:user_id>/approval', methods=['PUT'])
def update_approval(user_id):
    data = request.get_json()
    status = data.get('status')

    if status not in ['Approved', 'Disapproved']:
        return jsonify({'message': 'Invalid approval status'}), 400

    if update_user_approval(user_id, status):
        return jsonify({'message': 'Approval status updated successfully'}), 200
    else:
        return jsonify({'message': 'Failed to update approval status'}), 500

# Assign role to user
@app.route('/users/<int:user_id>/role', methods=['PUT'])
def assign_role(user_id):
    data = request.get_json()
    role_id = data.get('roleId')

    if not role_id:
        return jsonify({'message': 'Role ID is required'}), 400

    if assign_role_to_user(user_id, role_id):
        return jsonify({'message': 'Role assigned successfully'}), 200
    else:
        return jsonify({'message': 'Failed to assign role'}), 500
    
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        # Call the model function to delete the user
        delete_user_by_id(user_id)
        return jsonify({'message': f'User with ID {user_id} deleted successfully!'}), 200
    except Exception as e:
        print(f"Error deleting user: {e}")
        return jsonify({'error': f"Failed to delete user: {e}"}), 500
    
@app.route('/managed-projects', methods=['GET'])
def get_managed_projects():
    user_id = session.get('user_id')
    projects = get_projects_by_manager(user_id)
    return jsonify({'projects': projects})

@app.route('/project-members', methods=['GET'])
def get_project_members():
    user_id = session.get('user_id')
    members = get_project_members_by_manager(user_id)
    return jsonify({'members': members})

@app.route('/member-approval/<int:member_id>', methods=['PUT'])
def approve_member(member_id):
    data = request.get_json()
    project_id = data.get('project_id')
    status = data.get('status')

    update_member_project_status(member_id, project_id, status)
    return jsonify({'message': f'Member {status} successfully'})

@app.route('/remove-member/<int:member_id>/<int:project_id>', methods=['DELETE'])
def remove_member(member_id, project_id):
    remove_member_from_project(member_id, project_id)
    return jsonify({'message': 'Member removed successfully'})

@app.route('/member-projects', methods=['GET'])
def get_member_projects():
    user_id = session.get('user_id')

    # Debugging print
    print(f"Fetching projects for user_id: {user_id}")

    projects = get_projects_for_member(user_id)

    print(f"Projects retrieved: {projects}")  # Debugging print

    return jsonify({'projects': projects})

UPLOAD_FOLDER = "uploads"
UPLOAD_FOLDER_BOUNDARY = "boundaries"
UPLOAD_FOLDER_ORTHO = "orthomosaics"
UPLOAD_FOLDER_CHM = "chms"
ALLOWED_EXTENSIONS = {"zip"}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024 * 1024

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["UPLOAD_FOLDER_BOUNDARY"] = UPLOAD_FOLDER_BOUNDARY
app.config["UPLOAD_FOLDER_ORTHO"] = UPLOAD_FOLDER_ORTHO
app.config["UPLOAD_FOLDER_CHM"] = UPLOAD_FOLDER_CHM
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure directory exists
os.makedirs(UPLOAD_FOLDER_BOUNDARY, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_ORTHO, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_CHM, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/check-duplicate-upload', methods=['GET'])
def check_duplicate():
    filename = request.args.get("filename")
    project = request.args.get("project")

    if not filename or not project:
        return jsonify({"error": "Missing filename or project"}), 400

    exists = check_duplicate_upload(filename, project)
    return jsonify({"exists": exists})

@app.route('/upload', methods=['POST'])
def upload_uas_data():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        project = request.form.get("project", "")
        if check_duplicate_upload(filename, project):
            return jsonify({"error": "File with this name already exists in the project"}), 409
        
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        with open(file_path, "wb") as f:
            for chunk in file.stream:
                f.write(chunk)

        # Retrieve metadata from request
        metadata = request.form
        project = metadata.get("project", "")
        platform = metadata.get("platform", "")
        sensor = metadata.get("sensor", "")
        date = metadata.get("date", "")
        altitude = metadata.get("altitude", "")
        forward = metadata.get("forward", "")
        side = metadata.get("side", "")
        notes = metadata.get("notes", "")
        recipient_email = metadata.get("to", "").strip()
        cc_email = metadata.get("cc", "").strip()
        message = metadata.get("message", "")

        # Check for missing fields
        if not all([project, platform, sensor, date, altitude, forward, side, notes]):
            return jsonify({"error": "Missing metadata fields"}), 400

        try:
            save_upload_metadata(filename, project, platform, sensor, date, file_path, altitude, forward, side, notes)
            msg = Message(
                subject="New UAS Data Uploaded",
                sender="test@gmail.com",
                recipients=[recipient_email]
            )
            if cc_email:
                msg.cc = [cc_email]

            msg.body = f"""
            A new file has been uploaded.
            
            📂 File Name: {filename}
            📍 Project: {project}
            🚀 Platform: {platform}
            🎛️ Sensor: {sensor}
            📅 Date: {date}
            📩 Note: {message}

            File Path: {file_path}
            """
            mail.send(msg)
            return jsonify({"message": "File uploaded successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid file format"}), 400

@app.route('/uploads', methods=['GET'])
def fetch_uploaded_files():
    try:
        uploads = get_all_uploads()
        return jsonify(uploads), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/boundaries', methods=['GET'])
def get_boundaries():
    try:
        boundaries = get_all_boundaries()
        return jsonify(boundaries), 200
    except Exception as e:
        print(f"Error fetching boundaries: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/boundaries/upload', methods=['POST'])
def upload_boundary_data():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    projectId = request.form["projectId"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        fileName = secure_filename(file.filename)       
        
        filePath = os.path.join(app.config["UPLOAD_FOLDER_BOUNDARY"], fileName)
        with open(filePath, "wb") as f:
            for chunk in file.stream:
                f.write(chunk)

        try:
            save_upload_boundary_metadata(fileName, filePath, projectId)
            return jsonify({"message": "File uploaded successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid file format"}), 400

@app.route('/orthomosaics', methods=['GET'])
def get_orthomosaics():
    try:
        orthomosaics = get_all_orthomosaics()
        return jsonify(orthomosaics), 200
    except Exception as e:
        print(f"Error fetching orthomosaics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/orthomosaic/upload', methods=['POST'])
def upload_orthomosaic_data():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    projectId = request.form["projectId"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        fileName = secure_filename(file.filename)       
        
        filePath = os.path.join(app.config["UPLOAD_FOLDER_ORTHO"], fileName)
        with open(filePath, "wb") as f:
            for chunk in file.stream:
                f.write(chunk)

        try:
            save_upload_orthomosaic_metadata(fileName, filePath, projectId)
            return jsonify({"message": "File uploaded successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid file format"}), 400

@app.route('/chms', methods=['GET'])
def get_chms():
    try:
        chms = get_all_chms()
        return jsonify(chms), 200
    except Exception as e:
        print(f"Error fetching chms: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/chm/upload', methods=['POST'])
def upload_chm_data():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    projectId = request.form["projectId"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        fileName = secure_filename(file.filename)       
        
        filePath = os.path.join(app.config["UPLOAD_FOLDER_CHM"], fileName)
        with open(filePath, "wb") as f:
            for chunk in file.stream:
                f.write(chunk)

        try:
            save_upload_chm_metadata(fileName, filePath, projectId)
            return jsonify({"message": "File uploaded successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid file format"}), 400

@app.route('/generate-rgb-attributes', methods=['POST'])
def generate_rgb_attributes_endpoint():
    try:
        data = request.get_json()
        orthomosaic_image = data.get("orthomosaic_image")
        project = data.get("project")
        file_prefix = data.get("file_prefix", "default")
        epsg = data.get("epsg", 4326)
        boundary_shp = data.get("boundary_shp")
        
        if not orthomosaic_image or not project or not boundary_shp:
            return jsonify({"error": "Missing required fields"}), 400
        
        orthomosaic_path = os.path.join("orthomosaics", orthomosaic_image)
        boundary_path = os.path.join("boundaries", boundary_shp)

        # Define an output folder—for example, under "generated/<project>"
        output_folder = os.path.join("generated", project)
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
        
        # Step 1: Generate the canopy cover .dat file
        generate_cc_dat(orthomosaic_path, output_folder, file_prefix)
        
        # Step 2: Generate the updated boundary shapefile with canopy cover attributes
        generate_cc_boundary(epsg, boundary_path, output_folder, file_prefix)
        return jsonify({"message": "Canopy cover file generated successfully"}), 200
    except Exception as e:
        print("Error in /generate-rgb-attributes:", e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/download-rgb-attributes', methods =['POST'])
def download_rgb_attributes_endpoint():
    try:
        data = request.get_json()
        geojson_pattern = os.path.join("generated", data.get("projectName"), "cc_boundary", "cc_boundary_*.geojson")
        geojson_files = glob.glob(geojson_pattern)
        if not geojson_files:
            return jsonify({"error": "No boundary file found"}), 404
        geojson_path = geojson_files[0]
        gdf = geopandas.read_file(geojson_path)
        xlsx_path = geojson_path.replace(".geojson", ".xlsx")
        gdf.to_excel(xlsx_path, index=False)
        return send_file(xlsx_path,
                         as_attachment=True,
                         attachment_filename=os.path.basename(xlsx_path),
                         mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        )
        
    except Exception as e:
        sys.stdout.write("Error in /download-rgb-attributes:" + str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    try:
        # Run the Flask application
        app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
    finally:
        # Ensure that QGIS shuts down properly when the app stops.
        qgs.exitQgis()