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
        INSERT INTO project (name, crop, plantingDate, harvestDate, description, centerLat, centerLng, minZoom, maxZoom, defaultZoom, visualizationPage)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
            data['visualizationPage']
        ))
        conn.commit()
        print("Project added to the database.")
    except Exception as e:
        print(f"Database Error: {e}")
    finally:
        cursor.close()
        conn.close()


def update_project(id, name, plantingDate, harvestDate, description):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE project SET Name=%s, PlantingDate=%s, HarvestDate=%s, Description=%s WHERE id=%s",
        (name, plantingDate, harvestDate, description, id)
    )
    connection.commit()
    connection.close()

def delete_project(id):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM project WHERE id = %s", (id,))
    connection.commit()
    connection.close()