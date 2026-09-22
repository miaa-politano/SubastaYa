# SubastaYa - Real-Time Bidding Platform

A full-stack, real-time auction and electronic commerce platform designed with an ACID-compliant transactional core, escrow-backed bidding guarantees, dynamic anti-sniping protection, and scheduled background workers.

---

## Tech Stack
* **Frontend:** React 18, Tailwind CSS, Vite, SignalR Hub Client / WebSockets
* **Backend Core (.NET):** C# .NET 9, ASP.NET Core Web API, SignalR, Entity Framework Core
* **Microservices (Java):** Java 17, Spring Boot 3.2.3, Spring Data JPA, Hibernate ORM
* **Database & Infra:** PostgreSQL 16 (Containerized via Docker Compose)
* **Documentation & Contracts:** OpenAPI / Swagger UI

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [.NET 9 SDK](https://dotnet.microsoft.com/)
* [Node.js (LTS)](https://nodejs.org/)
* [Java Development Kit (JDK 17 LTS)](https://adoptium.net/)
* [IntelliJ IDEA](https://www.jetbrains.com/idea/) or your preferred IDE for Java microservices

### 2. Database Setup (Docker & Seed Data)
The project relies on a containerized PostgreSQL instance (`subastaya_db`) operating on the standard `public` schema. Run the container in the background:

```bash
docker compose up -d
```

To perform a clean reset of the relational schema and seed the mandatory baseline data (src/main/resources/data.sql):

```bash
docker compose down -v
docker compose up -d
```

Note: The persistence layer enforces PhysicalNamingStrategyStandardImpl and globally_quoted_identifiers=true to maintain strict uppercase naming consistency across Hibernate and PostgreSQL.

### 3. Running the Application
You will need separate terminal instances to execute all services simultaneously.

Backend Core (API & SignalR Hub):

```bash
cd backend/SubastaYa.Api
dotnet ef database update
dotnet run
```

API Base URL: http://localhost:5000 (or the port defined in launchSettings.json).
Swagger UI: http://localhost:5000/swagger

Java Microservices (Spring Boot):
1. Open the microservice-java module in IntelliJ IDEA.
2. Verify that src/main/resources/application.properties connects to jdbc:postgresql://localhost:5432/subastaya_db with spring.jpa.hibernate.ddl-auto=validate.
3. Run the application via org.example.Main (or SubastaYaApplication.java).

Port: http://localhost:8080
OpenAPI Documentation: http://localhost:8080/swagger-ui.html

Frontend (React Client):
```bash
cd frontend
npm install
npm run dev
```

Web Client: http://localhost:5173

---

## Mandatory Seed Data
The database automatically seeds standard test accounts and active auctions to validate user solvency and financial escrow constraints:
* vendedor@test.com (User ID 1): Seller account (Total Balance: $0.00).
* comprador1@test.com (User ID 2): Current leading bidder (Total: $150,000.00 | Locked: $45,000.00 | Available: $105,000.00).
* comprador2@test.com (User ID 3): Solvent prospective bidder (Total: $200,000.00 | Locked: $0.00 | Available: $200,000.00).
* sinfondos@test.com (User ID 4): Insolvent account (Total: $500.00 | Available: $500.00) designed to test bid rejections.

---

## Concurrency & Stress Testing (Optimistic Locking & ACID)
To satisfy strict academic evaluation criteria for concurrency control and transactional ACID consistency, the bidding service uses SERIALIZABLE transaction isolation combined with entity versioning (@Version Long). Below is the official test suite with raw terminal executions and real backend console outputs:

### TEST 1: Simultaneous Concurrency with Identical Amounts (TASK-028)
Simulates two distinct users (User 2 and User 3) submitting identical bids ($150,000.00) within the exact same millisecond:

```bash
docker exec -i subastaya_db psql -U postgres -d subastaya_db -c "UPDATE \"WALLET\" SET \"AVAILABLE_BALANCE\" = 500000.00, \"TOTAL_BALANCE\" = 500000.00 WHERE \"USER_ID\" IN (2, 3); UPDATE \"AUCTION\" SET \"STATUS\" = 'ACTIVAS', \"CURRENT_PRICE\" = 100000.00, \"END_DATE_UTC\" = CURRENT_TIMESTAMP + INTERVAL '2 days' WHERE \"ID\" = 1;" && curl -i -X POST http://localhost:8080/api/auctions/1/bids -H "Content-Type: application/json" -d '{"bidderId": 2, "amount": 150000.00}' & curl -i -X POST http://localhost:8080/api/auctions/1/bids -H "Content-Type: application/json" -d '{"bidderId": 3, "amount": 150000.00}' & wait
```

Real Console Output:
HTTP/1.1 409
HTTP 409 Conflict: Otro postor ha enviado una puja superior simultáneamente.
HTTP/1.1 200
{"id":1,"sellerId":1,"currentWinnerId":2,"categoryId":1,"title":"Notebook Gamer de Prueba","description":"Test Concurrencia","startingPrice":100000.00,"currentPrice":150000.00,"minIncrement":5000.00,"status":"ACTIVAS","version":10}

Mechanism: Both concurrent threads read the initial price simultaneously. Upon committing, the database detects the collision: the first thread succeeds (200 OK, version token increments to 10), and the concurrent thread fails serialization. Spring's controller intercepts the ConcurrencyFailureException and maps it cleanly to an HTTP 409 Conflict response.

---

### TEST 2: Escrow Guarantee Rejection (Insufficient Balance)
Evaluates an insolvent bidder (USER_ID = 4 with $500.00 available) trying to bid $150,000.00:

```bash
docker exec -i subastaya_db psql -U postgres -d subastaya_db -c "UPDATE \"WALLET\" SET \"TOTAL_BALANCE\" = 500.00, \"AVAILABLE_BALANCE\" = 500.00, \"LOCKED_BALANCE\" = 0.00 WHERE \"USER_ID\" = 4; UPDATE \"AUCTION\" SET \"STATUS\" = 'ACTIVAS', \"CURRENT_PRICE\" = 100000.00, \"END_DATE_UTC\" = CURRENT_TIMESTAMP + INTERVAL '2 days' WHERE \"ID\" = 1;" && curl -i -X POST http://localhost:8080/api/auctions/1/bids -H "Content-Type: application/json" -d '{"bidderId": 4, "amount": 150000.00}'
```

Real Console Output:
HTTP/1.1 400
Insufficient available balance to cover the bid amount.

Mechanism: WalletService inspects the user's available funds prior to state modification. Because available balance is lower than the proposed bid, execution is halted with an HTTP 400 Bad Request.

---

### TEST 3: Anti-Sniping Rule (Automatic Time Extension)
Tests a valid bid received within the critical 60-second window prior to auction closing:

```bash
docker exec -i subastaya_db psql -U postgres -d subastaya_db -c "UPDATE \"WALLET\" SET \"AVAILABLE_BALANCE\" = 500000.00, \"TOTAL_BALANCE\" = 500000.00 WHERE \"USER_ID\" = 3; UPDATE \"AUCTION\" SET \"STATUS\" = 'ACTIVAS', \"CURRENT_PRICE\" = 100000.00, \"END_DATE_UTC\" = CURRENT_TIMESTAMP + INTERVAL '45 seconds' WHERE \"ID\" = 1;" && curl -i -X POST http://localhost:8080/api/auctions/1/bids -H "Content-Type: application/json" -d '{"bidderId": 3, "amount": 150000.00}' && echo -e "\n🔍 AUDITING EXTENSION IN DATABASE:" && docker exec -i subastaya_db psql -U postgres -d subastaya_db -c "SELECT \"ID\", \"END_DATE_UTC\" AS \"NEW_EXTENDED_DATE\", \"CURRENT_PRICE\" FROM \"AUCTION\" WHERE \"ID\" = 1;"
```

Real Console Output:
HTTP/1.1 200
{"id":1,"sellerId":1,"currentWinnerId":3,"categoryId":1,"title":"Notebook Gamer de Prueba","description":"Test Concurrencia","startingPrice":100000.00,"currentPrice":150000.00,"minIncrement":5000.00,"status":"ACTIVAS","version":11}

🔍 AUDITING EXTENSION IN DATABASE:
 1 | 2026-09-19 21:36:51.382567 | 150000.00

Mechanism: Detecting that the auction is set to expire in 45 seconds, the service triggers the anti-sniping business rule, extending END_DATE_UTC by exactly 2 minutes directly in the database.

---

### TEST 4: Background Worker (Deserted Auction - TASK-022)
Tests scheduled background processing of an expired auction without bids:

```bash
docker exec -i subastaya_db psql -U postgres -d subastaya_db -c "INSERT INTO \"AUCTION\" (\"ID\", \"SELLER_ID\", \"CATEGORY_ID\", \"TITLE\", \"DESCRIPTION\", \"STARTING_PRICE\", \"CURRENT_PRICE\", \"MIN_INCREMENT\", \"START_DATE_UTC\", \"END_DATE_UTC\", \"STATUS\", \"VERSION\") VALUES (100, 1, 1, 'Subasta Desierta Test', 'Validating TASK-022', 50000.00, 50000.00, 2000.00, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '5 minutes', 'ACTIVAS', 0) ON CONFLICT (\"ID\") DO UPDATE SET \"STATUS\" = 'ACTIVAS', \"END_DATE_UTC\" = CURRENT_TIMESTAMP - INTERVAL '5 minutes', \"CURRENT_WINNER_ID\" = NULL;" && echo "⏳ Waiting 11 seconds for background worker..." && sleep 11 && echo -e "\n🔍 AUDITING FINAL STATUS FOR AUCTION 100:" && docker exec -i subastaya_db psql -U postgres -d subastaya_db -c "SELECT \"ID\", \"TITLE\", \"STATUS\", \"CURRENT_WINNER_ID\" FROM \"AUCTION\" WHERE \"ID\" = 100;"
```

Real Console Output:
AUDITING FINAL STATUS FOR AUCTION 100:
100 | Subasta Desierta Test | DESIERTAS | [null]

Mechanism: The worker sweeps expired auctions periodically (10-second interval in dev environment). Since no winning bids exist, it shifts the record state to DESIERTAS without applying financial debits.

---

### TEST 5: Escrow Fund Release & Guarantee Return (Wallet Clearing)
Verifies atomic fund management when a leading bid is outbid:

```bash
docker exec -i subastaya_db psql -U postgres -d subastaya_db -c "UPDATE \"WALLET\" SET \"AVAILABLE_BALANCE\" = 500000.00, \"TOTAL_BALANCE\" = 500000.00, \"LOCKED_BALANCE\" = 0.00 WHERE \"USER_ID\" IN (2, 3); UPDATE \"AUCTION\" SET \"STATUS\" = 'ACTIVAS', \"CURRENT_PRICE\" = 100000.00, \"END_DATE_UTC\" = CURRENT_TIMESTAMP + INTERVAL '2 days', \"CURRENT_WINNER_ID\" = NULL WHERE \"ID\" = 1;" && curl -s -o /dev/null -X POST http://localhost:8080/api/auctions/1/bids -H "Content-Type: application/json" -d '{"bidderId": 2, "amount": 150000.00}' && sleep 1 && curl -s -o /dev/null -X POST http://localhost:8080/api/auctions/1/bids -H "Content-Type: application/json" -d '{"bidderId": 3, "amount": 160000.00}' && echo -e "\n🔍 AUDITING FINAL WALLET BALANCES:" && docker exec -i subastaya_db psql -U postgres -d subastaya_db -c "SELECT \"USER_ID\", \"TOTAL_BALANCE\", \"AVAILABLE_BALANCE\", \"LOCKED_BALANCE\" FROM \"WALLET\" WHERE \"USER_ID\" IN (2, 3) ORDER BY \"USER_ID\";"
```

Real Console Output:
🔍 AUDITING FINAL WALLET BALANCES:
USER_ID | TOTAL_BALANCE | AVAILABLE_BALANCE | LOCKED_BALANCE
--------+---------------+-------------------+----------------
      2 |     500000.00 |         500000.00 |           0.00
      3 |     500000.00 |         340000.00 |      160000.00
(2 rows)

Mechanism: Upon receiving User 3's higher bid ($160,000.00), the system automatically locks User 3's guarantee while releasing User 2's previous escrow lock in the same atomic transaction (LOCKED_BALANCE returns to 0.00 and AVAILABLE_BALANCE returns to 500000.00).

---

### Authors
* Mateo Agustín Valencia Cortez
* Mía Valentina Politano

## License
This project is intended strictly for academic and private use (Universidad Nacional Arturo Jauretche).
