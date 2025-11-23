# Node.js backend + client
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy server & client
COPY server ./server
COPY client ./client
COPY package*.json ./

# Install dependencies
RUN npm install express mongoose cors

# Expose port
EXPOSE 5000

# Start server
CMD ["node","server/index.js"]
