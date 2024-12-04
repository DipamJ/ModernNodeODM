# ModernNodeODM

## Prerequisites
- Install [Docker](https://www.docker.com/get-started).

## Steps to Run the Application
1. Pull the Docker images:
   ```bash
   docker pull dipamj/modernnodeodm-backend:latest
   docker pull dipamj/modernnodeodm-frontend:latest
   docker pull dipamj/modernnodeodm-db:latest
2. Create a docker-compose.yml file on your local with below content:
   services:
  backend:
    image: dipamj/modernnodeodm-backend:latest
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=mydb

  frontend:
    image: dipamj/modernnodeodm-frontend:latest
    ports:
      - "3000:3000"
    depends_on:
      - backend

  db:
    image: dipamj/modernnodeodm-db:latest
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: mydb
3. Download and add db-dump.sql to your local folder.
4. Run the Application using the below command:
   docker-compose up
5. Access the Application:
  Frontend: http://localhost:3000
  Backend: http://localhost:5000
