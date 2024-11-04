from db_config import get_db_connection

def get_all_platforms():
    """Fetch all platforms from the database, ordered by name."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM platform ORDER BY Name")
        platforms = cursor.fetchall()
        conn.close()
        return platforms
    except Exception as e:
        print(f"Error retrieving platforms: {e}")
        return []

def add_platform(name):
    """Add a new platform to the database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO platform (Name) VALUES (%s)", (name,))
        conn.commit()
        print(f"Platform '{name}' added successfully.")
    except Exception as e:
        print(f"Error adding platform: {e}")
    finally:
        cursor.close()
        conn.close()

def update_platform(id, name):
    """Update an existing platform's name based on its ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE platform SET Name = %s WHERE id = %s", (name, id))
        conn.commit()
        print(f"Platform with ID {id} updated to '{name}'.")
    except Exception as e:
        print(f"Error updating platform: {e}")
    finally:
        cursor.close()
        conn.close()

def delete_platform(id):
    """Delete a platform from the database by its ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM platform WHERE id = %s", (id,))
        conn.commit()
        print(f"Platform with ID {id} deleted.")
    except Exception as e:
        print(f"Error deleting platform: {e}")
    finally:
        cursor.close()
        conn.close()