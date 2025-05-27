# --- Builder stage (optionnel pour rapidité et cache) ---
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Install only prod deps first for better caching (optionnel)
COPY package.json package-lock.json* ./
RUN npm install

# Copy Prisma schema + migrations
COPY prisma ./prisma

# Génère le client Prisma (après l'install ET le copy de prisma/)
RUN npx prisma generate

# Copy reste du code (src, etc)
COPY . .

# Expose le port dev
EXPOSE 3001

# Pour lancer le serveur avec hot reload (si tu utilises ts-node-dev, nodemon, etc)
CMD ["sh", "-c", "npx prisma studio --hostname 0.0.0.0 & npm run start:dev"]