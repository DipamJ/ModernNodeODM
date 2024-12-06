from db_config import get_db_connection

def get_all_sensors():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM sensor ORDER BY name")
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
        cursor.execute("INSERT INTO sensor (name) VALUES (%s)", (name,))
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
        cursor.execute("UPDATE sensor SET name = %s WHERE id_sensor = %s", (name, id))
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
        cursor.execute("DELETE FROM sensor WHERE id_sensor = %s", (id,))
        conn.commit()
        print(f"Sensor with ID {id} deleted.")
    except Exception as e:
        print(f"Error deleting sensor: {e}")
    finally:
        cursor.close()
        conn.close()