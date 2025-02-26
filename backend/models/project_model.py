from db_config import get_db_connection

def get_all_projects():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM project")
        projects = cursor.fetchall()
        connection.close()
        return projects
    except Exception as e:
        print(f"Error retrieving projects: {e}")
        return []

def add_project(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO project (name, crop, planting_date, harvest_date, description, center_lattitude, center_longitude, min_zoom, max_zoom, default_zoom, visualization_page, leader_id, season_year)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    query_membership = """
        INSERT INTO project_membership (project_id, user_id, role)
        VALUES (%s, %s, %s)
    """

    try:
        cursor.execute(query, (
            data['name'],
            data['crop'],
            data['plantingDate'],
            data['harvestDate'],
            data['description'],
            data['centerLatitude'],
            data['centerLongitude'],
            data['minZoom'],
            data['maxZoom'],
            data['defaultZoom'],
            data['visualizationPage'],
            data['leader_id'],
            data['seasonYear'],
        ))
        conn.commit()
        print("Project added to the database.")
        project_id = cursor.lastrowid
        cursor.execute(query_membership, (
            project_id,
            data['leader_id'],
            "Leader"
        ))
        conn.commit()
        print("Project Membership added to the database.")
        
    except Exception as e:
        print(f"Database Error: {e}")
    finally:
        cursor.close()
        conn.close()


def update_project(id, name, plantingDate, harvestDate, description):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE project SET name=%s, planting_date=%s, harvest_date=%s, description=%s WHERE id_project=%s",
        (name, plantingDate, harvestDate, description, id)
    )
    connection.commit()
    connection.close()

def delete_project(id):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM project WHERE id_project = %s", (id,))
    connection.commit()
    connection.close()

def get_project_by_id(project_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM project WHERE id_project = %s"
    try:
        cursor.execute(query, (project_id,))
        project = cursor.fetchone()
        return project
    except Exception as e:
        print(f"Error fetching project: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def get_projects_by_manager(user_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT p.id_project, p.name, p.description, p.planting_date, p.harvest_date, p.crop
            FROM project p
            WHERE p.leader_id = %s
        """
        
        cursor.execute(query, (user_id,))
        projects = cursor.fetchall()
        connection.close()
        return projects
    
    except Exception as e:
        print(f"Error fetching projects managed by user {user_id}: {e}")
        return []

def get_project_members_by_manager(user_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
                    SELECT 
                        u.id_user, 
                        u.first_name, 
                        u.last_name, 
                        u.email,
                        u.admin_approved as status, 
                        pm.project_id, 
                        p.name AS project_name, 
                        pm.role 
                    FROM 
                        project_membership pm
                    JOIN 
                        users u ON pm.user_id = u.id_user
                    JOIN 
                        project p ON pm.project_id = p.id_project
                    WHERE 
                        p.leader_id = %s 
                        AND pm.role = 'Member' 
                        AND (u.admin_approved = 'Approved' OR u.admin_approved = 'Pending');
                """

        cursor.execute(query, (user_id,))
        members = cursor.fetchall()
        connection.close()
        return members

    except Exception as e:
        print(f"Error fetching project members for manager {user_id}: {e}")
        return []

def update_member_project_status(member_id, project_id, status):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        if status == "Approved":
            # If approved, update admin_approved column in users table
            query = "UPDATE users SET admin_approved = %s WHERE id_user = %s"
            cursor.execute(query, (status, member_id))

        elif status == "Disapproved":
            # If disapproved, update admin_approved and remove from project_membership
            query_disapprove = "UPDATE users SET admin_approved = %s WHERE id_user = %s"
            cursor.execute(query_disapprove, (status, member_id))

            query_remove_membership = "DELETE FROM project_membership WHERE user_id = %s AND project_id = %s"
            cursor.execute(query_remove_membership, (member_id, project_id))

        connection.commit()
        connection.close()
        return True

    except Exception as e:
        print(f"Error updating member status: {e}")
        return False

def remove_member_from_project(member_id, project_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Delete the member from the project_membership table
        query_remove_membership = "DELETE FROM project_membership WHERE user_id = %s AND project_id = %s"
        cursor.execute(query_remove_membership, (member_id, project_id))

        # Check if the member is part of any other projects
        # query_check_other_projects = "SELECT COUNT(*) FROM project_membership WHERE user_id = %s"
        # cursor.execute(query_check_other_projects, (member_id,))
        # project_count = cursor.fetchone()[0]

        # if project_count == 0:
        #     # If the member is not in any other project, update admin_approved to "Disapproved"
        #     query_disapprove_member = "UPDATE users SET admin_approved = 'Disapproved' WHERE id_user = %s"
        #     cursor.execute(query_disapprove_member, (member_id,))

        connection.commit()
        connection.close()
        return True

    except Exception as e:
        print(f"Error removing member from project: {e}")
        return False

def get_projects_by_manager_email(manager_email):
    """Get all projects where the provided email belongs to the project leader."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT id_project FROM project 
        WHERE leader_id = (SELECT id_user FROM users WHERE email = %s)
    """
    cursor.execute(query, (manager_email,))
    projects = cursor.fetchall()
    cursor.close()
    conn.close()

    if not projects:
        print(f"No projects found for manager {manager_email}")

    return [project['id_project'] for project in projects]  # Returns list of project IDs

def add_member_to_project(user_id, project_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = "INSERT INTO project_membership (project_id, user_id, role) VALUES (%s, %s, 'Member')"
        cursor.execute(query, (project_id, user_id))
        conn.commit()
        print(f"User {user_id} successfully added to project {project_id}")
    except Exception as e:
        print(f"Database Error: {e}")  # Print detailed error message
    finally:
        cursor.close()
        conn.close()

def get_projects_for_member(user_id):
    """Retrieve all projects the member is part of"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT p.id_project, p.name, p.description
        FROM project_membership pm
        JOIN project p ON pm.project_id = p.id_project
        WHERE pm.user_id = %s
    """
    
    cursor.execute(query, (user_id,))
    projects = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return projects

def fetch_project_by_id(project_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM project WHERE id_project = %s", (project_id,))
    project = cursor.fetchone()
    connection.close()
    if project:
        return project
    return None 