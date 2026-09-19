# SubastaYa - Real-Time Bidding Platform

## Tech Stack
* **Frontend:** React, Tailwind CSS, Vite
* **Backend:** C# .NET 9, SignalR (WebSockets), Entity Framework Core
* **Database & Infra:** PostgreSQL, Docker Compose

## Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [.NET 9 SDK](https://dotnet.microsoft.com/)
* [Node.js (LTS)](https://nodejs.org/)

### 2. Database Setup (Docker & EF Core)
The project uses a containerized PostgreSQL database. Run the container in the background:
```bash
docker compose up -d
```

Once the database is running, apply the Code-First migrations to build the schema:
```bash
cd backend/SubastaYa.Api
dotnet ef database update
```

### 3. Running the Application
You need two separate terminal windows to run both environments simultaneously.

Backend (API & SignalR Hub):
```bash
cd backend/SubastaYa.Api
dotnet run
```

The API will be available at http://localhost:5000 (or the port specified in your launchSettings.json). Swagger UI documentation is available at /swagger.

Frontend (React UI):
```bash
cd frontend
npm install
npm run dev
```

The client will be available at http://localhost:5173.

Concurrency Testing (Optimistic Locking)
To demonstrate the concurrency management and ACID compliance, the system implements Optimistic Locking via a Version row token. If two users attempt to bid at the exact same millisecond, the database processes the first one and rejects the second, returning an HTTP 409 Conflict error.

You can validate this behavior using any of the following tools included in the /tests folder:

* Option 1: Postman (Recommended)
Import the collection file located at tests/SubastaYa_Concurrency.postman_collection.json.

Open the Collection Runner in Postman.

Select the bid request (POST /api/v1/auctions/1/bids), set Iterations: 10 and Delay: 0ms.

Upon execution, the first request will return 200 OK, while the simultaneous requests will return 409 Conflict.

(CLI alternative using Newman):

```Bash
newman run tests/SubastaYa_Concurrency.postman_collection.json -n 10
```
* Option 2: Bruno
The repository includes a native Bruno collection in plain text format.

Open the Bruno app and click Open Collection.

Select the tests/bruno-collection/ folder.

Run the Concurrent Bid Test request repeatedly and rapidly, or use the Bruno CLI:

```bash
bru run tests/bruno-collection/ConcurrentBid.bru
```

* Option 3: Bash Script (cURL)
If you prefer not to install external clients, execute this script in your terminal to fire two asynchronous requests in the exact same millisecond:

```bash
curl -X POST "http://localhost:5000/api/v1/auctions/1/bids" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "userId": "comprador1"}' & \
curl -X POST "http://localhost:5000/api/v1/auctions/1/bids" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "userId": "comprador2"}' & \
wait
```
### Authors
* Mateo Agustín Valencia Cortez
* Mía Valentina Politano

## License
This project is intended strictly for academic and private use (Universidad Nacional Arturo Jauretche).