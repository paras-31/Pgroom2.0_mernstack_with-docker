
# PGROOM2.0 MERN Stack with Docker
# PostgreSQL Setup & Verification

This project uses PostgreSQL as the main database, running as a Docker container. Follow these steps to set up and verify PostgreSQL integration:

### 1. Start PostgreSQL Docker Container

Run the following command to start PostgreSQL using Docker:

```sh
docker run --name my-postgres --network pgroom-net -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=pgrooms -p 5432:5432 -d postgres:15
```

### 2. Update Backend .env Credentials

Edit the `.env` file in `PGROOM_BACKEND/` to match the credentials used above:

```env
DB_HOST=my-postgres
DB_PORT=5432
DB_USER=admin
DB_PASS=admin123
DATABASE_NAME=pgrooms
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DATABASE_NAME}
```

### 3. Verify PostgreSQL Connection

After starting the backend container, check the logs or use API endpoints to confirm the backend connects to PostgreSQL successfully.

You can also use Prisma commands to verify the connection:

```sh
npx prisma db pull
npx prisma migrate status
```

Or use `psql` to connect manually:

```sh
psql -h localhost -U admin -d pgrooms
```

If you see a successful connection, your PostgreSQL setup is complete.

---

**Note:** The main branch for this repository is `prod_code`. All production-ready code and updates should be merged into this branch.

## Main Branch

**Note:** The main branch for this repository is `prod_code`. All production-ready code and updates should be merged into this branch.

## Overview


PGROOM2.0 is a full-stack application featuring both frontend and backend codebases. The project leverages Docker for containerization, enabling seamless deployment and environment consistency.

## PostgreSQL Brief

This project uses **PostgreSQL** as the primary database. PostgreSQL is a powerful, open-source relational database system known for its reliability, feature set, and performance. In PGROOM2.0, PostgreSQL is run as a Docker container, making setup and management easy and consistent across environments.

### PostgreSQL with Docker

- The PostgreSQL database is provided via the official Docker image (`postgres:15`).
- Credentials (host, port, user, password, database name) are configured in the backend `.env` file.
- The backend connects to the PostgreSQL container using these credentials.

#### Steps to Set Up PostgreSQL:

1. **Start PostgreSQL Docker Container**
        - Example command:
            ```sh
            docker run --name my-postgres --network pgroom-net -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=pgrooms -p 5432:5432 -d postgres:15
            ```
2. **Update Backend Credentials**
        - Edit the `.env` file in `PGROOM_BACKEND/` to match the credentials used in the Docker command above:
            ```env
            DB_HOST=my-postgres
            DB_PORT=5432
            DB_USER=admin
            DB_PASS=admin123
            DATABASE_NAME=pgrooms
            DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DATABASE_NAME}
            ```
3. **Verify PostgreSQL Connection**
        - Start the backend container and check the logs or use API endpoints to confirm the backend is able to connect to PostgreSQL successfully.
        - You can also use tools like `psql` or Prisma commands to test the connection:
            ```sh
            npx prisma db pull
            npx prisma migrate status
            ```

This ensures your backend is properly connected to the PostgreSQL database running in Docker.

---

## Project Structure

- `PGROOM_BACKEND/` — Node.js/Express backend, Prisma ORM, Docker setup
- `PGROOM_FRONTEND/` — React frontend, Docker setup
- `prisma/` — Prisma schema and migrations

---

## Docker Integration

### Why Docker?


Docker allows you to package applications and dependencies into containers, ensuring consistent environments across development, testing, and production. In this project, both the frontend and backend are containerized, and the database (PostgreSQL) is also run as a Docker container.

### Docker Network

A custom Docker network (e.g., `pgroom-net`) is created so all containers (frontend, backend, Prisma, PostgreSQL) can communicate with each other using container names as hostnames. This is essential for service discovery and isolation.

**How to create and use the network:**

```sh
docker network create pgroom-net
```

When running containers, attach them to this network:

```sh
docker run --name my-postgres --network pgroom-net -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=pgrooms -p 5432:5432 -d postgres:15
docker run --name backend_con_pgrooms --network pgroom-net -p 8000:8000 -d your-backend-image
docker run --name prism_con --network pgroom-net -p 5555:5555 -d your-prisma-image
docker run --name pgroom_con --network pgroom-net -p 8080:8080 -d your-frontend-image
```

**Use case:**  
- Containers can reach each other by name (e.g., `my-postgres`).
- Improves security and isolation.
- No need for hardcoded IP addresses.

---

## Frontend Docker Setup

- The frontend (`PGROOM_FRONTEND/`) has its own `Dockerfile`.
- This Dockerfile builds the React app and serves it using a web server (e.g., nginx).
- You can run the frontend container independently and attach it to the same Docker network.

---

## Backend Docker Setup

- The backend (`PGROOM_BACKEND/`) contains **two Dockerfiles**:
    - `Dockerfile`: For the main Node.js/Express backend application.
    - `Dockerfile.prisma`: For running Prisma migrations and managing the database schema.

#### Why Two Dockerfiles in Backend?

- **Main Dockerfile**: Builds and runs the backend server.
- **Prisma Dockerfile**: Used specifically for database migration tasks. This separation allows you to run migrations in a dedicated container, keeping the main app container lightweight and focused on serving API requests.

---

## Prisma and Database Migration

### Use Case of `Dockerfile.prisma`

- Prisma is an ORM used to interact with the PostgreSQL database.
- `Dockerfile.prisma` is designed to:
    - Install Prisma CLI
    - Run migration commands (`prisma migrate deploy`, `prisma generate`, etc.)
    - Ensure the database schema is up-to-date before the backend starts

### Migrating to PostgreSQL with Prisma

**Common Commands:**

```sh
# Run migrations
npx prisma migrate deploy

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Generate Prisma client
npx prisma generate
```

**With Docker:**

You can use the Prisma Dockerfile to run migrations inside a container:

```sh
docker build -f Dockerfile.prisma -t pgroom-prisma .
docker run --env-file .env --network pgroom-net pgroom-prisma
```

---

## Database Configuration via Docker


**PostgreSQL Setup Recap:**

- PostgreSQL runs as a Docker container using the official image.
- Credentials are set in the backend `.env` file and should match the Docker container environment variables.
- The backend connects to the database using these credentials, referencing the container name as the host.

---

## Typical Workflow

1. **Create Docker Network**
    - `docker network create pgroom-net`
2. **Start PostgreSQL Container**
    - Use `docker run` to start the database container attached to the network.
3. **Run Prisma Migrations**
    - Build and run the Prisma migration container using `Dockerfile.prisma` and attach it to the network.
    - This updates the database schema.
4. **Start Backend and Frontend Containers**
    - Build and run the backend and frontend containers using their respective Dockerfiles, attached to the same network.
    - Both containers connect to the database using credentials from `.env`.

---

## Summary


- **Docker** is used to containerize the frontend, backend, and database for consistent deployment.
- **Custom Docker network** allows containers to communicate securely and reliably by name.
- **Two Dockerfiles** in the backend: one for the app, one for Prisma migrations.
- **Prisma** manages database schema and migrations, with dedicated Docker support.
- **.env** file stores database credentials, referencing the Dockerized PostgreSQL instance.
- **PostgreSQL** is run as a Docker container, and credentials are updated in the backend `.env` file for connectivity.
- **prod_code** is the main branch for production-ready code.

This setup ensures a robust, scalable, and maintainable development and deployment workflow for PGROOM2.0.