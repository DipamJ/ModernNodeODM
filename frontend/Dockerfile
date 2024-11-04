# Use the official Node.js image as the parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the app’s code
COPY . .

# Expose the frontend port
EXPOSE 3000

# Command to start the React app
CMD ["npm", "start"]