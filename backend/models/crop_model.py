from db_config import get_db_connection

def get_all_crops():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM crop ORDER BY name")
        crops = cursor.fetchall()
        conn.close()
        return crops
    except Exception as e:
        print(f"Error retrieving crops: {e}")
        return []

def add_crop(name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO crop (name) VALUES (%s)", (name,))
        conn.commit()
        print(f"Crop '{name}' added successfully.")
    except Exception as e:
        print(f"Error adding crop: {e}")
    finally:
        cursor.close()
        conn.close()

def update_crop(id, name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE crop SET name = %s WHERE id_crop = %s", (name, id))
        conn.commit()
        print(f"Crop with ID {id} updated to '{name}'.")
    except Exception as e:
        print(f"Error updating crop: {e}")
    finally:
        cursor.close()
        conn.close()

def delete_crop(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM crop WHERE id_crop = %s", (id,))
        conn.commit()
        print(f"Crop with ID {id} deleted.")
    except Exception as e:
        print(f"Error deleting crop: {e}")
    finally:
        cursor.close()
        conn.close()
