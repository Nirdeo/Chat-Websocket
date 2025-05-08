# Chat WebSocket Project

This is a chat application with a NestJS backend and a frontend.

## Docker Setup

This project includes a complete Docker setup for the entire application, including:
- PostgreSQL database
- Adminer (database management tool)
- NestJS backend
- Next.js frontend

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Starting the Application

To start the entire application, run:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Adminer (database management tool) on port 8080
- NestJS backend on port 3001
- Next.js frontend on port 3000

### Database Connection Details

- **Host**: localhost
- **Port**: 5432
- **Username**: user
- **Password**: pass
- **Database**: db

These settings match the configuration in the `.env.local` file.

### Accessing Adminer

You can access Adminer at [http://localhost:8080](http://localhost:8080)

Login details:
- **System**: PostgreSQL
- **Server**: postgres
- **Username**: user
- **Password**: pass
- **Database**: db

### Stopping the Database

To stop the containers, run:

```bash
docker-compose down
```

To stop the containers and remove the volumes (this will delete all data), run:

```bash
docker-compose down -v
```

## Running the Application

### Using Docker for Development (Recommended)

The easiest way to run the entire application in development mode is using Docker Compose as described above:

```bash
docker-compose up -d
```

This will start all services in development mode with hot-reloading enabled, which means any changes you make to the source code will be automatically reflected without having to restart the containers.

You can then access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Adminer: http://localhost:8080

To view logs from all containers:

```bash
docker-compose logs -f
```

To view logs from a specific service:

```bash
docker-compose logs -f backend  # or frontend, postgres, adminer
```

The source code directories are mounted as volumes in the containers, so any changes you make to the code will be immediately reflected in the running application.

### Local Development (Without Docker)

If you prefer to run the application locally for development:

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

The backend will be available at http://localhost:3001 and the frontend at http://localhost:3000.

Note: When running locally, make sure your PostgreSQL database is running and accessible at the connection string specified in your `.env.local` file.
