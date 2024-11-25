from db_config import get_db_connection

def get_all_product_types():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM product_type")
        product_types = cursor.fetchall()
        connection.close()
        return product_types
    except Exception as e:
        print(f"Error retrieving product types: {e}")
        return []

def add_product_type(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO product_type (name, type)
        VALUES (%s, %s)
    """
    try:
        cursor.execute(query, (
            data['name'],
            data['type']
        ))
        conn.commit()
        print("Product type added to the database.")
    except Exception as e:
        print(f"Database Error: {e}")
    finally:
        cursor.close()
        conn.close()

def update_product_type(id, name, type):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE product_type SET name=%s, type=%s WHERE id=%s",
        (name, type, id)
    )
    connection.commit()
    connection.close()

def delete_product_type(id):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM product_type WHERE id = %s", (id,))
    connection.commit()
    connection.close()
