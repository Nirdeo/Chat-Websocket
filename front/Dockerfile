# Utilise une version slim de Node.js
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers de dépendances en premier (optimise le cache Docker)
COPY package.json package-lock.json* ./

# Installation des dépendances
RUN npm install

# Copie tout le code source
COPY . .

# Expose les ports utilisés par Next.js (et un autre si nécessaire)
EXPOSE 3000

# Lancer le serveur de développement Next.js
CMD ["npm", "run", "dev"]
