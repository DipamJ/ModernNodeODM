from db_config import get_db_connection

def get_all_orthomosaics():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * from orthomosaic ORDER BY ortho_file_name")
        orthomosaics = cursor.fetchall()
        conn.close()
        return orthomosaics
    except Exception as e:
        print(f"Error retrieving orthomosaics: {e}")
        return []
    
def save_upload_orthomosaic_metadata(fileName, filePath, projectId):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO orthomosaic (ortho_file_name, ortho_file_path, project_id)
            values (%s, %s, %s)
        """
        cursor.execute(query, (fileName, filePath, projectId))
        conn.commit()
        conn.close()
    except Exception as e:
        raise Exception(f"Database Insert Error: {e}")