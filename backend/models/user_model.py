from db_config import get_db_connection

def get_user_by_email(email):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        connection.close()
        return user
    except Exception as e:
        print(f"Error retrieving user: {e}")
        return None
