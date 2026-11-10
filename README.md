# Dockerized Full-Stack App

A small REST API and PostgreSQL database running as separate containers with Docker Compose.

## Architecture
```text
Browser / curl
     |
     v
Node.js API :3000  ----->  PostgreSQL :5432
     |                         |
 /health, /api/tasks        named volume
```

## Run
Requirements: Docker Engine and Docker Compose plugin.

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
curl http://localhost:3000/health
curl http://localhost:3000/api/tasks
```

Create a task:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Learn Docker Compose"}'
```

Stop: `docker compose down`. Remove database data too: `docker compose down -v` (destructive).

## DevOps concepts
- Separate application and database containers.
- Health checks and service dependency readiness.
- Persistent PostgreSQL volume.
- Environment-based configuration; do not commit real secrets.
- GitHub Actions runs tests and validates the Compose configuration.

This is a learning/demo setup. Do not expose the database port publicly or use the example credentials in production.
