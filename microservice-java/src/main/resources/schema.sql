DROP TABLE IF EXISTS "AUDIT_LOG" CASCADE;
DROP TABLE IF EXISTS "TRANSACTION_LEDGER" CASCADE;
DROP TABLE IF EXISTS "BID" CASCADE;
DROP TABLE IF EXISTS "WALLET" CASCADE;
DROP TABLE IF EXISTS "AUCTION" CASCADE;
DROP TABLE IF EXISTS "CATEGORY" CASCADE;
DROP TABLE IF EXISTS "USER" CASCADE;

-- 1. ESTRUCTURAS DE TABLAS EN MAYÚSCULAS (Macheo de Entidades Puro)
CREATE TABLE "USER" (
                        "ID" SERIAL PRIMARY KEY,
                        "USERNAME" VARCHAR(50) NOT NULL,
                        "EMAIL" VARCHAR(100) NOT NULL UNIQUE,
                        "PASSWORD_HASH" VARCHAR(255) NOT NULL,
                        "CREATED_AT" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CATEGORY" (
                            "ID" SERIAL PRIMARY KEY,
                            "NAME" VARCHAR(100) NOT NULL UNIQUE,
                            "DESCRIPTION" VARCHAR(255) NOT NULL DEFAULT 'Sin descripción académica',
                            "VERSION" BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE "AUCTION" (
                           "ID" SERIAL PRIMARY KEY,
                           "SELLER_ID" INT NOT NULL REFERENCES "USER"("ID"),
                           "CURRENT_WINNER_ID" INT REFERENCES "USER"("ID"),
                           "CATEGORY_ID" INT REFERENCES "CATEGORY"("ID"),
                           "TITLE" VARCHAR(255) NOT NULL,
                           "DESCRIPTION" TEXT,
                           "STARTING_PRICE" DECIMAL(18,2) NOT NULL,
                           "CURRENT_PRICE" DECIMAL(18,2) NOT NULL,
                           "MIN_INCREMENT" DECIMAL(18,2) NOT NULL,
                           "START_DATE_UTC" TIMESTAMP NOT NULL,
                           "END_DATE_UTC" TIMESTAMP NOT NULL,
                           "STATUS" VARCHAR(50) NOT NULL,
                           "VERSION" BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE "WALLET" (
                          "ID" SERIAL PRIMARY KEY,
                          "USER_ID" INT NOT NULL UNIQUE REFERENCES "USER"("ID"),
                          "TOTAL_BALANCE" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
                          "LOCKED_BALANCE" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
                          "AVAILABLE_BALANCE" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
                          "VERSION" BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE "TRANSACTION_LEDGER" (
                                      "ID" SERIAL PRIMARY KEY,
                                      "WALLET_ID" INT NOT NULL REFERENCES "WALLET"("ID"),
                                      "TYPE" VARCHAR(50) NOT NULL,
                                      "AMOUNT" DECIMAL(18,2) NOT NULL,
                                      "DESCRIPTION" VARCHAR(255) NOT NULL,
                                      "CREATED_AT_UTC" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AUDIT_LOG" (
                             "ID" BIGSERIAL PRIMARY KEY, -- Machea perfecto con el 'Long id' de AuditLog.java
                             "AUCTION_ID" INT NOT NULL,
                             "EVENT_TYPE" VARCHAR(100) NOT NULL,
                             "PREVIOUS_STATE" VARCHAR(50),
                             "NEW_STATE" VARCHAR(50),
                             "MESSAGE" VARCHAR(500),
                             "CREATED_AT_UTC" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. DATOS SEMILLA EXIGIDOS POR LA CÁTEDRA
INSERT INTO "USER" ("ID", "USERNAME", "EMAIL", "PASSWORD_HASH") VALUES
                                                                    (1, 'vendedor', 'vendedor@test.com', 'hash_mock_vendedor'),
                                                                    (2, 'comprador1', 'comprador1@test.com', 'hash_mock_comp1'),
                                                                    (3, 'comprador2', 'comprador2@test.com', 'hash_mock_comp2'),
                                                                    (4, 'sinfondos', 'sinfondos@test.com', 'hash_mock_sinfondos');

INSERT INTO "CATEGORY" ("ID", "NAME", "DESCRIPTION") VALUES
                                                         (1, 'Tecnología', 'Artículos electrónicos y hardware'),
                                                         (2, 'Coleccionables', 'Objetos raros de colección'),
                                                         (3, 'Indumentaria', 'Ropa y accesorios de diseño'),
                                                         (4, 'Vehículos', 'Autos y rodados a subastar');

INSERT INTO "WALLET" ("ID", "USER_ID", "TOTAL_BALANCE", "LOCKED_BALANCE", "AVAILABLE_BALANCE") VALUES
                                                                                                   (1, 1, 0.00, 0.00, 0.00),
                                                                                                   (2, 2, 150000.00, 45000.00, 105000.00), -- Total = Retenido + Disponible
                                                                                                   (3, 3, 200000.00, 0.00, 200000.00),
                                                                                                   (4, 4, 500.00, 0.00, 500.00);

INSERT INTO "AUCTION" ("ID", "SELLER_ID", "CATEGORY_ID", "TITLE", "DESCRIPTION", "STARTING_PRICE", "CURRENT_PRICE", "MIN_INCREMENT", "START_DATE_UTC", "END_DATE_UTC", "STATUS", "CURRENT_WINNER_ID") VALUES
                                                                                                                                                                                                          (1, 1, 1, 'Notebook Gamer Lenovo Legion', 'Procesador Intel i7, RTX 4060. Configurado para test de concurrencia.', 100000.00, 120000.00, 5000.00, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 minutes', 'ACTIVE', 2),
                                                                                                                                                                                                          (2, 1, 1, 'Monitor 27'' 165Hz IPS', 'Panel VA, 1ms de respuesta, QHD. Validando flujos alternativos.', 50000.00, 50000.00, 2000.00, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '45 minutes', 'ACTIVE', NULL);
