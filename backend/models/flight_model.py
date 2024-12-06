from db_config import get_db_connection

def get_all_flights():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM flight")
        projects = cursor.fetchall()
        connection.close()
        return projects
    except Exception as e:
        print(f"Error retrieving projects: {e}")
        return []

def add_flight(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO flight (name, date, project, platform, sensor, altitude, forward, side)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        cursor.execute(query, (
            data['name'],
            data['date'],
            data['project'],
            data['platform'],
            data['sensor'],
            data['altitude'],
            data['forward'],
            data['side']
        ))
        conn.commit()
        print("Flight added to the database.")
    except Exception as e:
        print(f"Database Error: {e}")
    finally:
        cursor.close()
        conn.close()


def update_flight(id, name, date, project, platform, sensor, altitude, forward, side):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE flight SET name=%s, date=%s, project=%s, platform=%s, sensor=%s, altitude=%s, forward=%s, side=%s WHERE id_flight=%s",
        (name, date, project, platform, sensor, altitude, forward, side, id)
    )
    connection.commit()
    connection.close()

def delete_flight(id):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM flight WHERE id_flight = %s", (id,))
    connection.commit()
    connection.close()