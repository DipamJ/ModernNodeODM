# ModernNodeODM

## Prerequisites
- Install [Docker](https://www.docker.com/get-started).

## Steps to Run the Application
1. Pull the Docker images:
   ```bash
   docker pull dipamj/modernnodeodm-backend:latest
   docker pull dipamj/modernnodeodm-frontend:latest
   docker pull dipamj/modernnodeodm-db:latest
2. Download and save the file docker-compose-replace.yml present in the repo as docker-compose.yml in your local folder.
3. Download and add db-dump.sql present in the repo to your local folder.
4. Run the Application using the below command:
   docker-compose up
5. Access the Application:
   Frontend: http://localhost:3000
   Backend: http://localhost:5000
