from db_config import get_db_connection

def get_all_roles():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM roles")
        roles = cursor.fetchall()
        conn.close()
        return roles
    except Exception as e:
        print(f"Error retrieving roles: {e}")
        return []

def add_role(role_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "INSERT INTO roles (role_name) VALUES (%s)"
        cursor.execute(query, (role_name,))
        conn.commit()
        conn.close()
        print(f"Role '{role_name}' added successfully.")
    except Exception as e:
        print(f"Error adding role: {e}")

def update_role(role_id, role_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "UPDATE roles SET role_name = %s WHERE role_id = %s"
        cursor.execute(query, (role_name, role_id))
        conn.commit()
        conn.close()
        print(f"Role '{role_id}' updated successfully.")
    except Exception as e:
        print(f"Error updating role: {e}")

def delete_role(role_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "DELETE FROM roles WHERE role_id = %s"
        cursor.execute(query, (role_id,))
        conn.commit()
        conn.close()
        print(f"Role '{role_id}' deleted successfully.")
    except Exception as e:
        print(f"Error deleting role: {e}")