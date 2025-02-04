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
        INSERT INTO project (name, crop, planting_date, harvest_date, description, center_lattitude, center_longitude, min_zoom, max_zoom, default_zoom, visualization_page, leader_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
            data['leader_id']
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