from db_config import get_db_connection

def get_all_chms():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * from chms ORDER BY chm_file_name")
        chms = cursor.fetchall()
        conn.close()
        return chms
    except Exception as e:
        print(f"Error retrieving chms: {e}")
        return []
    
def save_upload_chm_metadata(fileName, filePath, projectId):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO chm (chm_file_name, chm_file_path, project_id)
            values (%s, %s, %s)
        """
        cursor.execute(query, (fileName, filePath, projectId))
        conn.commit()
        conn.close()
    except Exception as e:
        raise Exception(f"Database Insert Error: {e}")