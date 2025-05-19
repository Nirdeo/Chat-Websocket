ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the app source
COPY . .

# Expose port for development and Prisma Studio
EXPOSE 3001 5555

# Start development server with hot reload and Prisma Studio
CMD ["sh", "-c", "npx prisma studio & npm run start:dev"]