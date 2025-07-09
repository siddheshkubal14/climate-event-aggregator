# 🌍 Climate Event Aggregator

A resilient, modular, and scalable system that consumes high-frequency climate data over WebSocket, aggregates it into hourly candlestick (OHLC) format per city, and serves it via a secure GraphQL API. The project includes a D3-powered React frontend for dynamic candlestick visualization.

---

## Features

- Connects to a real-time weather WebSocket stream (simulated or real)
- Aggregates per-city temperature into hourly OHLC candlestick data
- Stores aggregated data in Redis for persistence and fast retrieval
- Serves data via a GraphQL API built on Express Server
- Secured with API key validation, Helmet, and rate limiting middleware
- Responsive frontend built with React, Vite, and D3.js
- Unit tested with Mocha and Chai
- Fully Dockerized for local orchestration and deployment, including simulator and Redis

---

## Known Issue
Here's a concise snippet you can place under a new or existing **`## Known Issues`** section in your `README.md`:

---

## Known Issues

### 🌐 API Rate Limit (Open-Meteo)

If the Open-Meteo API quota is exceeded, weather data will stop streaming and no new events will be aggregated. This is handled gracefully in the simulator:

```ts
if (data?.error && data.reason?.includes("limit")) {
  logger.log("warn", "API limit reached. Skipping further requests.");
  return;
}
```

## Folder Structure

```

.
├── backend/
│   ├── graphql/              # GraphQL schema and resolvers
│   ├── middlewares/          # CORS, API key auth, error handling, rate limiting
│   ├── services/             # WebSocket client, aggregation, Redis client
│   ├── simulator/            # Weather stream simulator (WebSocket server)
│   ├── tests/                # Unit tests (Mocha + Chai)
│   ├── utils/                # Logger, Redis client setup
│   ├── app.ts                # Application bootstrap logic
│   ├── server.ts             # Server and Express setup
│   ├── config.ts             # Environment configuration
│   ├── constants.ts          # Global constants
│   ├── Dockerfile            # Backend Docker image
│   ├── Dockerfile.simulator  # Simulator Docker image
│   └── package.json          # Backend dependencies and scripts
├── frontend/
│   ├── src/                  # React and D3 components
│   ├── index.html            # Main static HTML
│   ├── Dockerfile            # Frontend Docker image
│   ├── package.json          # Frontend dependencies and scripts
│   └── tsconfig.json         # TypeScript config
├── docker-compose.yml        # Multi-service orchestration (backend, frontend, redis, simulator)
├── deploy.sh                 # Build, stop, remove, and deploy all services
└── readme.md                 # This documentation

````

---

## Architecture Overview

### Backend

- GraphQL API using Express Server
- Aggregator service aggregates WebSocket climate events by hour and city into OHLC format
- Aggregated data stored in **Redis** for persistence and fast access
- WebSocket client connects to the weather stream simulator or real source, with retry and backoff
- API secured with API key middleware, rate limiting, and Helmet headers
- Unit tested with **Mocha** and **Chai**

### Simulator

- Runs a WebSocket server simulating weather events from multiple cities
- Fetches real weather data from Open-Meteo API and streams it to connected clients
- Can be run inside Docker with a separate Dockerfile (`Dockerfile.simulator`)

### Frontend

- React app bootstrapped with Vite
- Renders candlestick charts using D3.js based on data queried from the GraphQL API

---

## Environment Variables

Configure `.env` files with the following variables (examples):

```env
(provided separately)
````

---

## Docker & Deployment

The project is fully containerized for easy setup:

* `backend` service (GraphQL API + WebSocket client)
* `frontend` service (React UI)
* `redis` service (data store)
* `simulator` service (weather event WebSocket server)

### Key Notes

* The backend connects to Redis using host `redis` inside Docker network.
* Simulator streams weather events to backend via WebSocket at port 8765.
* Docker Compose orchestrates all services on a shared network.
* Use the provided `deploy.sh` script to build, stop, remove old containers/images, push to Docker Hub, and redeploy fresh containers.

### Running Locally and Automate Deployment

```bash
./deploy.sh
```

Services will be accessible at:

* Frontend UI: [http://localhost:5173](http://localhost:5173)
* Backend GraphQL API: [http://localhost:4000/graphql](http://localhost:4000/graphql)
* Simulator WebSocket: `ws://localhost:8765`
* Redis Server: [http://localhost:6379](http://localhost:6379)

---

## Testing

Unit tests for backend services and middleware using **Mocha** + **Chai**:

```bash
cd backend
npm install
npm run test
```

Tests cover:

* Aggregation logic (`aggregator.test.ts`)
* API key authentication middleware (`auth.test.ts`)

---

## Sample GraphQL Query

```graphql
query {
  candlesticks(city: "Berlin") {
    hour
    open
    close
    min
    max
  }
}
```

**Authorization header:**

```
Authorization: Bearer YOUR_API_KEY
```

---

## Future Improvements

| Area             | Enhancement                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| Data Persistence | Add Redis persistence with expiration, archiving, or TimescaleDB support |
| Event Processing | Use message queues (e.g., Kafka) to decouple ingestion and aggregation   |
| Testing          | Add integration and e2e tests                                            |
| Frontend UX      | Add city filters, zooming, tooltips, and historical data navigation      |
| Auth             | Implement OAuth2 / JWT with role-based permissions                       |
| Monitoring       | Integrate Prometheus, Grafana, and alerting                              |
| CI/CD            | Automate build, test, and deployment with GitHub Actions                 |
| Scaling          | Enable multi-instance scaling, load balancing, and Redis clustering      |

---

## Design Principles

* Separation of concerns between simulation, backend API, and frontend UI
* Use Redis for scalable, persistent caching of aggregated data
* Secure-by-default API with API key validation, rate limiting, and HTTP security headers
* Docker-first approach for consistent dev and production environments
* Modular architecture for easy extension and maintenance

---


