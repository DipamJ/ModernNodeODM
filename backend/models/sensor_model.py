from db_config import get_db_connection

def get_all_sensors():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM sensor ORDER BY Name")
        sensors = cursor.fetchall()
        conn.close()
        return sensors
    except Exception as e:
        print(f"Error retrieving sensors: {e}")
        return []

def add_sensor(name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sensor (Name) VALUES (%s)", (name,))
        conn.commit()
        print(f"Sensor '{name}' added successfully.")
    except Exception as e:
        print(f"Error adding sensor: {e}")
    finally:
        cursor.close()
        conn.close()

def update_sensor(id, name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE sensor SET Name = %s WHERE id = %s", (name, id))
        conn.commit()
        print(f"Sensor with ID {id} updated to '{name}'.")
    except Exception as e:
        print(f"Error updating sensor: {e}")
    finally:
        cursor.close()
        conn.close()

def delete_sensor(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sensor WHERE id = %s", (id,))
        conn.commit()
        print(f"Sensor with ID {id} deleted.")
    except Exception as e:
        print(f"Error deleting sensor: {e}")
    finally:
        cursor.close()
        conn.close()