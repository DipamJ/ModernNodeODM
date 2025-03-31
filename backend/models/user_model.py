import sys
from db_config import get_db_connection
import logging

def get_user_by_email(email):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        logging.debug(f"Queried user for email '{email}': {user}")
        connection.close()
        return user
    except Exception as e:
        logging.error(f"Error retrieving user: {e}")
        return None
    
def register_user(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO users (first_name, last_name, email, password, admin_approved)
        VALUES (%s, %s, %s, %s, 'Pending')
    """
    try:
        cursor.execute(query, (
            data['first_name'],
            data['last_name'],
            data['email'],
            data['password']
        ))
        conn.commit()
        user_id = cursor.lastrowid  # Get the last inserted user ID
        sys.stdout.write(f"User added with ID {user_id} \n")
        return user_id
    except Exception as e:
        sys.stdout.write(f"Database Error: {e}")
        return None
    finally:
        cursor.close()
        conn.close()


# Fetch all users with roles and approval status
def get_all_users():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT u.id_user, u.first_name, u.last_name, u.email, u.admin_approved, r.role_id, r.role_name
            FROM users u
            LEFT JOIN users_roles ur ON u.id_user = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.role_id
        """
        cursor.execute(query)
        users = cursor.fetchall()
        connection.close()
        return users
    except Exception as e:
        print(f"Error fetching users: {e}")
        return []

# Update approval status
def update_user_approval(user_id, status):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = "UPDATE users SET admin_approved = %s WHERE id_user = %s"
        cursor.execute(query, (status, user_id))
        connection.commit()
        connection.close()
        return True
    except Exception as e:
        print(f"Error updating user approval: {e}")
        return False

# Assign role to user
def assign_role_to_user(user_id, role_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if the user already has a role
        check_query = "SELECT * FROM users_roles WHERE user_id = %s"
        cursor.execute(check_query, (user_id,))
        existing_roles = cursor.fetchall()

        if existing_roles:
            # Remove existing roles for the user
            delete_query = "DELETE FROM users_roles WHERE user_id = %s"
            cursor.execute(delete_query, (user_id,))

        # Assign the new role
        insert_query = "INSERT INTO users_roles (user_id, role_id) VALUES (%s, %s)"
        cursor.execute(insert_query, (user_id, role_id))
        connection.commit()
        connection.close()
        return True
    except Exception as e:
        print(f"Error assigning role: {e}")
        return False

def delete_user_by_id(user_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # First, delete the user's role association (if any)
        cursor.execute("DELETE FROM users_roles WHERE user_id = %s", (user_id,))
        
        # Then, delete the user record
        cursor.execute("DELETE FROM users WHERE id_user = %s", (user_id,))
        
        connection.commit()
        connection.close()
        print(f"User with ID {user_id} deleted successfully!")
    except Exception as e:
        print(f"Error deleting user: {e}")
        raise

def get_user_roles(user_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT r.role_name 
            FROM users_roles ur
            INNER JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = %s
        """
        cursor.execute(query, (user_id,))
        roles = cursor.fetchall()
        connection.close()
        return roles
    except Exception as e:
        print(f"Error fetching user roles: {e}")
        return []
    
def get_user_by_id(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM users WHERE id_user = %s"
    try:
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()
        return user
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None
    finally:
        cursor.close()
        conn.close()