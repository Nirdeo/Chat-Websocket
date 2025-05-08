FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# In development mode, we don't need to copy the source code
# as it will be mounted as a volume
# COPY . .

# Skip build step in development mode
# RUN npm run build

EXPOSE 3000

# Use development mode with hot-reloading
CMD ["npm", "run", "dev"]
