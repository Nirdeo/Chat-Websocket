# Chat WebSocket & WebRTC

Application de chat en temps réel avec fonctionnalités de messagerie textuelle et d'appels vidéo, utilisant WebSocket et WebRTC.

## Fonctionnalités

- Chat en temps réel entre utilisateurs
- Appels vidéo par WebRTC
- Création de salles de discussion
- Interface utilisateur intuitive

## Technologies utilisées

- **Frontend** : Next.js, React, TailwindCSS, Socket.io-client, Simple-peer (WebRTC)
- **Backend** : NestJS, Socket.io
- **Docker** : Conteneurisation pour un déploiement facile

## Installation et démarrage

### Prérequis

- Node.js (v16+)
- Docker et Docker Compose (optionnel)

### Installation sans Docker

1. Cloner le dépôt :
```bash
git clone https://github.com/votre-utilisateur/chat-websocket.git
cd chat-websocket
```

2. Installer les dépendances backend :
```bash
cd back
npm install
```

3. Installer les dépendances frontend :
```bash
cd ../front
npm install
```

### Démarrage sans Docker

1. Démarrer le backend :
```bash
cd back
npm run start:dev
```

2. Dans un autre terminal, démarrer le frontend :
```bash
cd front
npm run dev
```

3. Accéder à l'application dans votre navigateur à l'adresse : http://localhost:3000

### Démarrage avec Docker

```bash
docker-compose up -d
```

## Utilisation

1. Entrez votre nom d'utilisateur
2. Entrez ou créez un ID de salle
3. Cliquez sur "Rejoindre"
4. Pour démarrer un appel vidéo, cliquez sur "Démarrer l'appel"
5. Pour terminer l'appel, cliquez sur "Terminer l'appel"

## Notes concernant WebRTC

L'application utilise WebRTC pour les appels vidéo. Pour une expérience optimale :
- Utilisez Chrome, Firefox ou Edge récents
- Accordez les permissions de caméra et microphone quand demandées
- Sur certains réseaux avec NAT ou pare-feu restrictifs, les connexions WebRTC peuvent être bloquées

# Projet Chat WebSocket

Ceci est une application de chat avec un backend NestJS et un frontend Next.js.

## Configuration de développement Docker

Ce projet inclut un environnement de développement Docker complet avec rechargement à chaud (hot-reloading) pour les services frontend et backend :
- Frontend Next.js (mode développement)
- Backend NestJS (mode développement)
- Base de données PostgreSQL
- Adminer (outil de gestion de base de données)

### Prérequis

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Commandes NPM Docker

Ce projet inclut des scripts NPM pour faciliter la gestion des opérations Docker :

| Commande | Description |
|---------|-------------|
| `npm run docker:up` | Démarrer les conteneurs en mode interactif |
| `npm run docker:up:build` | Démarrer les conteneurs après reconstruction des images |
| `npm run docker:up:detach` | Démarrer les conteneurs en arrière-plan (mode détaché) |
| `npm run docker:down` | Arrêter les conteneurs |
| `npm run docker:down:orphans` | Arrêter les conteneurs et supprimer les conteneurs orphelins |
| `npm run docker:logs` | Afficher les logs des conteneurs en temps réel |
| `npm run docker:start` | Alias pour docker:up:detach |
| `npm run docker:stop` | Alias pour docker:down |

Exemples d'utilisation :
```bash
# Démarrer l'environnement de développement en arrière-plan
npm run docker:start

# Reconstruire et démarrer les conteneurs après des changements de dépendances
npm run docker:up:build

# Afficher les logs de tous les conteneurs
npm run docker:logs
```

### Détails Docker spécifiques au projet

- **Version Node.js** : Le backend et le frontend utilisent `node:22.13.1-slim`
- **Frontend** : 
  - Serveur de développement sur le port **3000**
  - Rechargement à chaud activé
  - Code source monté comme volume
- **Backend** : 
  - Serveur de développement sur le port **3001**
  - Rechargement à chaud activé
  - Code source monté comme volume
- **PostgreSQL** : 
  - Port **5432**
  - Données persistées dans un volume Docker
- **Adminer** : 
  - Port **8080**
  - Gestion de base de données via interface web

### Variables d'environnement

Identifiants par défaut de la base de données dans `compose.yaml` :
```yaml
POSTGRES_USER: user
POSTGRES_PASSWORD: pass
POSTGRES_DB: db
```

### Démarrage de l'environnement de développement

Démarrer tous les services :
```bash
docker compose up -d
```

Docker construira automatiquement les images si elles n'existent pas.

Utilisez `--build` uniquement si vous avez :
- Modifié un Dockerfile
- Changé des dépendances dans package.json
- Besoin de forcer la reconstruction des images

```bash
docker compose up -d --build
```

Cela démarrera :
- Frontend Next.js (http://localhost:3000)
- Backend NestJS (http://localhost:3001)
- Base de données PostgreSQL (localhost:5432)
- Adminer (http://localhost:8080)

### Configuration critique des fichiers .env et Prisma

Pour assurer le bon fonctionnement de l'application avec Docker, veuillez suivre ces instructions importantes :

#### Configuration du backend (.env)

1. Créez ou modifiez le fichier `back/.env` avec ces paramètres de connexion à la base de données :
```
DATABASE_URL="postgresql://user:pass@postgres:5432/db?schema=public"
PORT=3001
FRONT_URL="http://localhost:3000"
```

**IMPORTANT**: L'hôte dans l'URL de connexion doit être `postgres` (nom du service dans Docker Compose) et non pas `localhost`.

#### Configuration de Prisma

1. Après modification du fichier .env, vous devez initialiser Prisma :
```bash
docker compose exec backend npx prisma generate
docker compose exec backend npx prisma migrate dev --name init_schema
```

2. Si vous modifiez le schéma Prisma (`back/prisma/schema.prisma`), vous devez régénérer le client :
```bash
docker compose exec backend npx prisma generate
```

3. Résolution des problèmes courants :
   - Si vous rencontrez des erreurs de types Prisma, assurez-vous que le client a été correctement généré
   - Pour réinitialiser la base de données : `docker compose exec backend npx prisma migrate reset --force`
   - Après toute modification de schéma, redémarrez le backend : `docker compose restart backend`

#### Configuration du fichier .env racine

Assurez-vous que le fichier `.env` à la racine du projet contient ces identifiants PostgreSQL pour Docker Compose :
```
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=db
```

### Fonctionnalités de développement

1. **Rechargement à chaud** :
   - Les changements de code frontend et backend sont automatiquement détectés
   - L'application se met à jour en temps réel sans redémarrage
   - Les modules Node sont persistés dans des volumes Docker

2. **Gestion de la base de données** :
   - Accès à Adminer sur http://localhost:8080
   - Détails de connexion :
     - Système : PostgreSQL
     - Serveur : postgres
     - Nom d'utilisateur : user
     - Mot de passe : pass
     - Base de données : db

3. **Montages de volumes** :
   ```yaml
   # Volumes frontend
   - ./front:/app
   - /app/node_modules

   # Volumes backend
   - ./back:/app
   - /app/node_modules

   # Données PostgreSQL
   - pgdata:/var/lib/postgresql/data
   ```

### Fichiers de configuration Docker

1. **Développement Frontend** (`front/Dockerfile.dev`) :
   - Image Node.js optimisée pour le développement
   - npm install avec dépendances de développement
   - Rechargement à chaud avec `npm run dev`

2. **Développement Backend** (`back/Dockerfile.dev`) :
   - Image Node.js optimisée pour le développement
   - npm install avec dépendances de développement
   - Rechargement à chaud avec `npm run start:dev`

3. **Docker Compose** (`compose.yaml`) :
   - Configuration des services de développement
   - Configuration réseau
   - Gestion des volumes
   - Dépendances des services

### Arrêt de l'environnement

Arrêter tous les services :
```bash
docker compose down
```

Supprimer tous les conteneurs et volumes :
```bash
docker compose down -v
```

### Logs et débogage

Afficher tous les logs des conteneurs :
```bash
docker compose logs -f
```

Afficher les logs d'un service spécifique :
```bash
docker compose logs -f frontend  # ou backend, postgres, adminer
```

### Flux de travail de développement

1. Démarrer l'environnement : `docker compose up -d`
2. Faire des modifications au code frontend dans `./front`
3. Faire des modifications au code backend dans `./back`
4. Les changements sont automatiquement reflétés
5. Consulter les logs pour déboguer les problèmes
6. Accéder à Adminer pour gérer la base de données

### Avantages de cette configuration

- Environnement de développement isolé
- Mises à jour du code en temps réel
- Pas besoin d'installation locale de Node.js
- Environnement cohérent pour toute l'équipe
- Gestion facile de la base de données
- Environnement local similaire à la production

## Configuration Docker

Ce projet inclut une configuration Docker complète pour l'ensemble de l'application, comprenant :
- Base de données PostgreSQL
- Adminer (outil de gestion de base de données)
- Backend NestJS
- Frontend Next.js

### Prérequis

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Détails Docker spécifiques au projet

- **Version Node.js** : Les Dockerfiles du backend et du frontend utilisent `node:22.13.1-slim` (défini via l'argument de construction `NODE_VERSION`).
- **Backend** : Expose le port **3001** (application NestJS)
- **Frontend** : Expose le port **3000** (application Next.js)
- **PostgreSQL** : Expose le port **5432**
- **Adminer** : Expose le port **8080**
- **Données persistantes** : Les données PostgreSQL sont stockées dans un volume Docker (`pgdata`).
- **Utilisateur/Groupe** : Les conteneurs backend et frontend s'exécutent en tant qu'utilisateurs non-root pour la sécurité.

### Variables d'environnement

- Les identifiants par défaut de la base de données sont définis dans le `docker-compose.yml` :
  - `POSTGRES_USER: user`
  - `POSTGRES_PASSWORD: pass`
  - `POSTGRES_DB: db`
- Si vous avez des variables d'environnement supplémentaires pour le backend ou le frontend, vous pouvez créer des fichiers `.env` dans les répertoires respectifs et décommenter les lignes `env_file` dans le fichier compose.

### Démarrage de l'application

Pour construire et démarrer tous les services, exécutez :

```bash
docker-compose up -d
```

Cela démarrera :
- Base de données PostgreSQL sur le port 5432
- Adminer (outil de gestion de base de données) sur le port 8080
- Backend NestJS sur le port 3001
- Frontend Next.js sur le port 3000

### Accès aux services

- **Frontend** : [http://localhost:3000](http://localhost:3000)
- **API Backend** : [http://localhost:3001](http://localhost:3001)
- **Adminer** : [http://localhost:8080](http://localhost:8080)

### Détails de connexion à la base de données

- **Hôte** : localhost
- **Port** : 5432
- **Nom d'utilisateur** : user
- **Mot de passe** : pass
- **Base de données** : db

Ces paramètres correspondent à la configuration dans le fichier Docker Compose.

### Arrêt de l'application

Pour arrêter et supprimer tous les conteneurs :

```bash
docker-compose down
```

Pour également supprimer le volume de base de données (toutes les données seront perdues) :

```bash
docker-compose down -v
```

---

## Exécution de l'application

### Utilisation de Docker pour le développement (Recommandé)

La façon la plus simple d'exécuter l'application complète en mode développement est d'utiliser Docker Compose comme décrit ci-dessus :

```bash
docker-compose up -d
```

Cela démarrera tous les services en mode développement avec rechargement à chaud activé, ce qui signifie que tous les changements que vous apportez au code source seront automatiquement reflétés sans avoir à redémarrer les conteneurs.

Vous pourrez alors accéder à :
- Frontend : http://localhost:3000
- API Backend : http://localhost:3001
- Adminer : http://localhost:8080

Pour afficher les logs de tous les conteneurs :

```bash
docker-compose logs -f
```

Pour afficher les logs d'un service spécifique :

```bash
docker-compose logs -f backend  # ou frontend, postgres, adminer
```

Les répertoires de code source sont montés comme volumes dans les conteneurs, donc tout changement que vous faites au code sera immédiatement reflété dans l'application en cours d'exécution.

### Développement local (Sans Docker)

Si vous préférez exécuter l'application localement pour le développement :

#### Backend

```bash
cd back
npm install
npm run start:dev
```

#### Frontend

```bash
cd front
npm install
npm run dev
```

Le backend sera disponible sur http://localhost:3001 et le frontend sur http://localhost:3000.

Remarque : Lors de l'exécution en local, assurez-vous que votre base de données PostgreSQL est en cours d'exécution et accessible à la chaîne de connexion spécifiée dans votre fichier `.env.local`.
