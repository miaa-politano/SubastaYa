DROP TABLE IF EXISTS AUDIT_LOG CASCADE;
DROP TABLE IF EXISTS TRANSACTION_LEDGER CASCADE;
DROP TABLE IF EXISTS BID CASCADE;
DROP TABLE IF EXISTS WALLET CASCADE;
DROP TABLE IF EXISTS AUCTION CASCADE;
DROP TABLE IF EXISTS "USER" CASCADE;

CREATE TABLE "USER" (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(50) NOT NULL,
                        email VARCHAR(100) NOT NULL UNIQUE,
                        password_hash VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AUCTION (
                         id SERIAL PRIMARY KEY,
                         seller_id INT NOT NULL REFERENCES "USER"(id),
                         title VARCHAR(100) NOT NULL,
                         description TEXT,
                         starting_price DECIMAL(18,2) NOT NULL,
                         current_price DECIMAL(18,2) NOT NULL,
                         min_increment DECIMAL(18,2) NOT NULL,
                         start_date_utc TIMESTAMP NOT NULL,
                         end_date_utc TIMESTAMP NOT NULL,
                         status VARCHAR(20) NOT NULL,
                         current_winner_id INT REFERENCES "USER"(id),
                         version INT NOT NULL DEFAULT 0
);

CREATE TABLE WALLET (
                        id SERIAL PRIMARY KEY,
                        user_id INT NOT NULL UNIQUE REFERENCES "USER"(id),
                        total_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
                        locked_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
                        available_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
                        version INT NOT NULL DEFAULT 0
);

CREATE TABLE TRANSACTION_LEDGER (
                                    id SERIAL PRIMARY KEY,
                                    wallet_id INT NOT NULL REFERENCES WALLET(id),
                                    type VARCHAR(20) NOT NULL,
                                    amount DECIMAL(18,2) NOT NULL,
                                    description VARCHAR(255),
                                    created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "USER" (id, username, email, password_hash) VALUES
                                                            (1, 'vendedor', 'vendedor@test.com', 'hash_mock_vendedor'),
                                                            (2, 'comprador1', 'comprador1@test.com', 'hash_mock_comp1'),
                                                            (3, 'comprador2', 'comprador2@test.com', 'hash_mock_comp2'),
                                                            (4, 'sinfondos', 'sinfondos@test.com', 'hash_mock_sinfondos');

INSERT INTO WALLET (id, user_id, total_balance, locked_balance, available_balance) VALUES
                                                                                       (1, 1, 0.00, 0.00, 0.00),
                                                                                       (2, 2, 150000.00, 450000.00, 105000.00),
                                                                                       (3, 3, 200000.00, 0.00, 200000.00),
                                                                                       (4, 4, 500.00, 0.00, 500.00);

INSERT INTO AUCTION (id, seller_id, title, description, starting_price, current_price, min_increment, start_date_utc, end_date_utc, status, current_winner_id) VALUES
                                                                                                                                                                   (1, 1, 'Notebook Gamer de Prueba', 'Test', 100000.00, 120000.00, 5000.00, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 minutes', 'ACTIVAS', 2),
                                                                                                                                                                   (2, 1, 'Subasta Critica', 'Anti-sniping', 50000.00, 50000.00, 2000.00, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '45 seconds', 'ACTIVAS', NULL);

SELECT setval('"USER_ID_seq"', 4);
SELECT setval('"AUCTION_ID_seq"', 1);
SELECT setval('"WALLET_ID_seq"', 4);