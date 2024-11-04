import mysql.connector
import os

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host='localhost',  # Use host.docker.internal to point to host machine
            user= 'root',
            password= 'Winter.123',
            database= 'mydb',
            port= '3306'  # Default MySQL port
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        raise