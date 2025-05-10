ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the app source
COPY . .

# Expose port for development
EXPOSE 3001

# Start development server with hot reload
CMD ["npm", "run", "start:dev"]