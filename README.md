# SGarden - Inventory Management API

A REST API for inventory and product management. Available in five implementations:

- **Java** (Spring Boot) - `java/` directory
- **Python** (FastAPI) - `python/` directory
- **JavaScript** (Express) - `javascript/` directory
- **TypeScript** (Express) - `typescript/` directory

All implementations expose the **same API contract** and connect to the same MongoDB database.

## Prerequisites

- MongoDB (running locally on port 27017, or set `DATABASE_URL` env var)
- **Java track:** JDK 17+, Maven 3.8+
- **Python track:** Python 3.10+, pip
- **JavaScript track:** Node.js 18+
- **TypeScript track:** Node.js 18+


## Quick Start

### Java (Spring Boot)

```bash
cd java
mvn spring-boot:run
```

The server starts on `http://localhost:4000`.

### Python (FastAPI)

```bash
cd python
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 4000 --reload
```

The server starts on `http://localhost:4000`.

### JavaScript (Express)

```bash
cd javascript
npm install
npm run dev
```

The server starts on `http://localhost:4000`.

### TypeScript (Express)

```bash
cd typescript
npm install
npm run dev
```

The server starts on `http://localhost:4000`.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/summary/:id` | Get product summary |
| GET | `/api/products/card/:id` | Get product card |
| POST | `/api/products` | Create a product (auth required) |
| PUT | `/api/products/:id` | Update a product (auth required) |
| DELETE | `/api/products/:id` | Delete a product (auth required) |
| POST | `/api/products/:id/discount` | Apply discount (auth required) |
| POST | `/api/products/:id/restock` | Restock product (auth required) |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile/:id` | Get user profile (auth required) |
| GET | `/api/users/details/:id` | Get user details (auth required) |
| GET | `/api/users/search` | Search users (query param: query) |
| GET | `/api/users/advanced-search` | Advanced search with filters |
| GET | `/api/users/summary/:id` | Get user summary (auth required) |
| GET | `/api/users/card/:id` | Get user card (auth required) |
| GET | `/api/users/reports/download` | Download report (auth required, query: filename) |
| POST | `/api/users/system/info` | Execute system command (auth required) |
| POST | `/api/users/hash` | Hash data (MD5) |
| PUT | `/api/users/:id/role` | Change user role (auth required) |
| DELETE | `/api/users/:id` | Delete user (auth required) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

### Test Users

The application seeds two test users on startup:

- **Admin:** username: `admin`, password: `admin123` (role: admin)
- **User:** username: `user`, password: `user1234` (role: user)

## Environment Variables / Configuration

### Java, Python, JavaScript, TypeScript (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `mongodb://localhost:27017/sgarden` | MongoDB connection string |
| `PORT` | `4000` | Server port |
| `SERVER_SECRET` | `sgarden-secret-key` | JWT signing secret |

