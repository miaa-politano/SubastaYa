SET TIME ZONE 'America/Buenos_Aires';

DROP TABLE IF EXISTS "AUDIT_LOG" CASCADE;
DROP TABLE IF EXISTS "TRANSACTION_LEDGER" CASCADE;
DROP TABLE IF EXISTS "BID" CASCADE;
DROP TABLE IF EXISTS "WALLET" CASCADE;
DROP TABLE IF EXISTS "AUCTION" CASCADE;
DROP TABLE IF EXISTS "CATEGORY" CASCADE;
DROP TABLE IF EXISTS "USER" CASCADE;

CREATE TABLE "USER"
(
    "ID"            SERIAL PRIMARY KEY,
    "USERNAME"      VARCHAR(50)  NOT NULL,
    "EMAIL"         VARCHAR(100) NOT NULL UNIQUE,
    "PASSWORD_HASH" VARCHAR(255) NOT NULL,
    "CREATED_AT"    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CATEGORY"
(
    "ID"          SERIAL PRIMARY KEY,
    "NAME"        VARCHAR(100) NOT NULL UNIQUE,
    "DESCRIPTION" VARCHAR(255) NOT NULL DEFAULT 'Sin descripción',
    "VERSION"     BIGINT       NOT NULL DEFAULT 0
);

CREATE TABLE "AUCTION"
(
    "ID"                SERIAL PRIMARY KEY,
    "SELLER_ID"         INT            NOT NULL REFERENCES "USER" ("ID"),
    "CURRENT_WINNER_ID" INT REFERENCES "USER" ("ID"),
    "CATEGORY_ID"       INT REFERENCES "CATEGORY" ("ID"),
    "TITLE"             VARCHAR(255)   NOT NULL,
    "DESCRIPTION"       TEXT,
    "STARTING_PRICE"    DECIMAL(18, 2) NOT NULL,
    "CURRENT_PRICE"     DECIMAL(18, 2) NOT NULL,
    "MIN_INCREMENT"     DECIMAL(18, 2) NOT NULL,
    "START_DATE_UTC"    TIMESTAMPTZ    NOT NULL,
    "END_DATE_UTC"      TIMESTAMPTZ    NOT NULL,
    "STATUS"            VARCHAR(50)    NOT NULL,
    "VERSION"           BIGINT         NOT NULL DEFAULT 0
);

CREATE TABLE "BID"
(
    "ID"             SERIAL PRIMARY KEY,
    "AUCTION_ID"     INT            NOT NULL REFERENCES "AUCTION" ("ID") ON DELETE CASCADE,
    "BIDDER_ID"      INT            NOT NULL REFERENCES "USER" ("ID"),
    "AMOUNT"         DECIMAL(18, 2) NOT NULL,
    "CREATED_AT_UTC" TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "WALLET"
(
    "ID"                SERIAL PRIMARY KEY,
    "USER_ID"           INT            NOT NULL UNIQUE REFERENCES "USER" ("ID"),
    "TOTAL_BALANCE"     DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    "LOCKED_BALANCE"    DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    "AVAILABLE_BALANCE" DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    "VERSION"           BIGINT         NOT NULL DEFAULT 0
);

CREATE TABLE "TRANSACTION_LEDGER"
(
    "ID"             SERIAL PRIMARY KEY,
    "WALLET_ID"      INT            NOT NULL REFERENCES "WALLET" ("ID"),
    "TYPE"           VARCHAR(50)    NOT NULL,
    "AMOUNT"         DECIMAL(18, 2) NOT NULL,
    "DESCRIPTION"    VARCHAR(255)   NOT NULL,
    "CREATED_AT_UTC" TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AUDIT_LOG"
(
    "ID"             BIGSERIAL PRIMARY KEY,
    "AUCTION_ID"     INT          NOT NULL,
    "EVENT_TYPE"     VARCHAR(100) NOT NULL,
    "PREVIOUS_STATE" VARCHAR(50),
    "NEW_STATE"      VARCHAR(50),
    "MESSAGE"        VARCHAR(500),
    "CREATED_AT_UTC" TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "USER" ("ID", "USERNAME", "EMAIL", "PASSWORD_HASH")
VALUES (1, 'vendedor', 'vendedor@test.com', 'hash_mock_vendedor'),
       (2, 'comprador1', 'comprador1@test.com', 'hash_mock_comp1'),
       (3, 'comprador2', 'comprador2@test.com', 'hash_mock_comp2'),
       (4, 'sinfondos', 'sinfondos@test.com', 'hash_mock_sinfondos');

INSERT INTO "CATEGORY" ("ID", "NAME", "DESCRIPTION")
VALUES (1, 'Tecnología', 'Artículos electrónicos y hardware'),
       (2, 'Coleccionables', 'Objetos raros de colección'),
       (3, 'Indumentaria', 'Ropa y accesorios de diseño'),
       (4, 'Vehículos', 'Autos y rodados a subastar');

INSERT INTO "WALLET" ("ID", "USER_ID", "TOTAL_BALANCE", "LOCKED_BALANCE", "AVAILABLE_BALANCE")
VALUES (1, 1, 0.00, 0.00, 0.00),
       (2, 2, 150000.00, 45000.00, 105000.00), -- Total: 150k, Retenido: 45k, Disp: 105k
       (3, 3, 200000.00, 0.00, 200000.00),     -- Total: 200k, Retenido: 0k, Disp: 200k
       (4, 4, 500.00, 0.00, 500.00); -- Para pruebas de saldo insuficiente

INSERT INTO "AUCTION" ("ID", "SELLER_ID", "CATEGORY_ID", "TITLE", "DESCRIPTION", "STARTING_PRICE", "CURRENT_PRICE",
                       "MIN_INCREMENT", "START_DATE_UTC", "END_DATE_UTC", "STATUS", "CURRENT_WINNER_ID")
VALUES (1, 1, 1, 'Notebook Gamer Lenovo Legion',
        'Procesador Intel i7, RTX 4060. Configurado para test de concurrencia.', 35000.00, 45000.00, 5000.00,
        (NOW() AT TIME ZONE 'UTC') - INTERVAL '12 hours', (NOW() AT TIME ZONE 'UTC') + INTERVAL '25 minutes', 'ACTIVAS',
        2),

       (2, 1, 1, 'Monitor 27'' 165Hz IPS', 'Panel IPS, 1ms de respuesta, QHD. Subasta en zona de descuento crítico.',
        50000.00, 50000.00, 2000.00, (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day',
        (NOW() AT TIME ZONE 'UTC') + INTERVAL '90 seconds', 'ACTIVAS', NULL),

       (3, 1, 2, 'Moneda de Oro Colonial Coleccionable',
        'Pieza histórica del año 1780 en perfecto estado de conservación.', 120000.00, 120000.00, 5000.00,
        (NOW() AT TIME ZONE 'UTC') + INTERVAL '24 hours', (NOW() AT TIME ZONE 'UTC') + INTERVAL '48 hours', 'PROXIMAS',
        NULL),

       (4, 1, 4, 'Camioneta 4x4 Off-Road', 'Fecha límite concluida. Lista para adjudicación contable final.', 300000.00,
        310000.00, 10000.00, (NOW() AT TIME ZONE 'UTC') - INTERVAL '5 hours',
        (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 hour', 'ACTIVAS', 3),

       (5, 1, 3, 'Campera de Cuero de Diseñador', 'Artículo discontinuado. Finalizada sin interacción de postores.',
        25000.00, 25000.00, 10000.00, (NOW() AT TIME ZONE 'UTC') - INTERVAL '3 hours',
        (NOW() AT TIME ZONE 'UTC') - INTERVAL '10 minutes', 'ACTIVAS', NULL);

INSERT INTO "BID" ("ID", "AUCTION_ID", "BIDDER_ID", "AMOUNT", "CREATED_AT_UTC")
VALUES (1, 1, 3, 40000.00, (NOW() AT TIME ZONE 'UTC') - INTERVAL '11 hours'),
       (2, 1, 2, 45000.00, (NOW() AT TIME ZONE 'UTC') - INTERVAL '10 hours');

INSERT INTO "BID" ("ID", "AUCTION_ID", "BIDDER_ID", "AMOUNT", "CREATED_AT_UTC")
VALUES (3, 4, 3, 310000.00, (NOW() AT TIME ZONE 'UTC') - INTERVAL '4 hours');

INSERT INTO "TRANSACTION_LEDGER" ("WALLET_ID", "TYPE", "AMOUNT", "DESCRIPTION", "CREATED_AT_UTC")
VALUES (2, 'DEPOSIT', 150000.00, 'Acreditación inicial de fondos por pasarela',
        (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days'),
       (2, 'LOCK', 45000.00, 'Retención preventiva (Garantía Escrow) por Oferta Líder en Subasta #1',
        (NOW() AT TIME ZONE 'UTC') - INTERVAL '10 hours'),
       (3, 'DEPOSIT', 200000.00, 'Acreditación inicial de fondos por pasarela',
        (NOW() AT TIME ZONE 'UTC') - INTERVAL '2 days'),
       (4, 'DEPOSIT', 500.00, 'Depósito básico de control de cuenta', (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day');