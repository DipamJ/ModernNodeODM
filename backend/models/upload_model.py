from db_config import get_db_connection

def save_upload_metadata(filename, project, platform, sensor, date, file_path, altitude, forward, side, notes):
    """Saves UAS data upload metadata to the database."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
            INSERT INTO uas_uploads (filename, project, platform, sensor, date, file_path, altitude, forward, side, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (filename, project, platform, sensor, date, file_path, altitude, forward, side, notes))
        connection.commit()
        connection.close()
    except Exception as e:
        raise Exception(f"Database Insert Error: {e}")
    
def get_all_uploads():
    """Fetch all uploaded files from the database."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM uas_uploads ORDER BY uploaded_at DESC")
        uploads = cursor.fetchall()
        connection.close()
        return uploads
    except Exception as e:
        raise Exception(f"Database Fetch Error: {e}")
    
def check_duplicate_upload(filename, project):
    """Check if the combination of filename and project already exists."""
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "SELECT COUNT(*) FROM uas_uploads WHERE filename = %s AND project = %s"
    cursor.execute(query, (filename, project))
    count = cursor.fetchone()[0]
    connection.close()
    return count > 0
