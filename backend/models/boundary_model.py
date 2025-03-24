from db_config import get_db_connection

def get_all_boundaries():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * from boundary ORDER BY boundary_file_name")
        boundaries = cursor.fetchall()
        conn.close()
        return boundaries
    except Exception as e:
        print(f"Error retrieving boundaries: {e}")
        return []
    
def save_upload_boundary_metadata(fileName, filePath, projectId):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
            INSERT INTO boundary (boundary_file_name, boundary_file_path, project_id)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (fileName, filePath, projectId))
        connection.commit()
        connection.close()
    except Exception as e:
        raise Exception(f"Database Insert Error: {e}")