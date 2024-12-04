import os
import mysql.connector

def get_db_connection():
    """
    Establishes and returns a connection to the MySQL database using environment variables.

    Returns:
        connection (mysql.connector.connection.MySQLConnection): MySQL connection object if successful.
        None: If the connection fails.
    """
    try:
        # Fetch environment variables with defaults
        host = os.getenv("DB_HOST", "localhost")
        port = int(os.getenv("DB_PORT", 3306))
        user = os.getenv("DB_USER", "root")
        password = os.getenv("DB_PASSWORD", "")
        database = os.getenv("DB_NAME", "mydb")

        # Establish the connection
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database
        )

        print(f"Successfully connected to the database '{database}' at {host}:{port} as user '{user}'.")
        return connection

    except mysql.connector.Error as err:
        # Handle specific MySQL errors
        print(f"Database connection error: {err}")
        return None

    except Exception as e:
        # Handle any other unexpected errors
        print(f"Unexpected error: {e}")
        return None
