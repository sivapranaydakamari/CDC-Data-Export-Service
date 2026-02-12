# CDC Data Export Service

## Project Overview

This project is a containerized backend service that implements Change Data Capture (CDC) using a timestamp-based watermark approach.

It allows different consumers to export user data in three ways:

- Full export
- Incremental export
- Delta export (INSERT / UPDATE / DELETE)

The system tracks export progress using a watermark table so that only new or updated records are exported in future requests.

---

## Tech Stack

- Node.js (Express)
- PostgreSQL 13
- Docker & Docker Compose
- Jest (Unit Testing)
- csv-writer (CSV generation)

---

## How It Works

### Full Export
Exports all non-deleted users and sets the watermark for the consumer.

### Incremental Export
Exports only records where:
```

updated_at > last_exported_at

````
Soft-deleted records are excluded.

### Delta Export
Exports changed records with an extra column:
- INSERT
- UPDATE
- DELETE

### Watermark
Each consumer has its own watermark stored in the `watermarks` table.

---

## How To Run

Make sure Docker is installed.

Run:

```bash
docker-compose up --build
````

The service will start on:

```
http://localhost:8080
```

---

## Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

## API Endpoints

### Full Export

```
POST /exports/full
Header: X-Consumer-ID
```

### Incremental Export

```
POST /exports/incremental
Header: X-Consumer-ID
```

### Delta Export

```
POST /exports/delta
Header: X-Consumer-ID
```

### Get Watermark

```
GET /exports/watermark
Header: X-Consumer-ID
```

---

## Database

Two tables are used:

### users

* id
* name
* email
* created_at
* updated_at
* is_deleted

An index is created on `updated_at` for better performance.

The database is automatically seeded with 100,000+ users on startup.

### watermarks

Stores the last exported timestamp for each consumer.

---

## Export Files

All generated CSV files are written to:

```
/output
```

This folder is mounted using Docker volumes.

---

## Running Tests

Enter the container:

```bash
docker exec -it <app_container_name> sh
```

Run:

```bash
npm test
npm run test:coverage
```

Test coverage is above 70%.

---

## Environment Variables

See `.env.example` for required variables:

* PORT
* DATABASE_URL
* NODE_ENV

---

## Key Features

* Asynchronous export jobs
* Transaction-safe watermark updates
* Structured JSON logging
* Multiple consumers supported
* Idempotent database seeding
* 70%+ test coverage

---

## Future Improvements

* Job status tracking
* Pagination for large exports
* Message queue integration