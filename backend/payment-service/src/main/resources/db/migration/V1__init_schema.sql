-- =========================================================================
-- Payment Service Migration: Initial Schema (V1__init_schema.sql)
-- Database: Microsoft SQL Server (smarttrip_payment_db)
-- =========================================================================

IF OBJECT_ID('dbo.wallets', 'U') IS NULL
CREATE TABLE dbo.wallets (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    held_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency NVARCHAR(10) NOT NULL DEFAULT 'VND',
    status NVARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    version BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

IF OBJECT_ID('dbo.wallet_transactions', 'U') IS NULL
CREATE TABLE dbo.wallet_transactions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    wallet_id BIGINT NOT NULL,
    transaction_type NVARCHAR(30) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reference_type NVARCHAR(50),
    reference_id NVARCHAR(100),
    idempotency_key NVARCHAR(100) UNIQUE,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_wallet FOREIGN KEY (wallet_id) REFERENCES dbo.wallets(id) ON DELETE CASCADE
);

IF OBJECT_ID('dbo.payments', 'U') IS NULL
CREATE TABLE dbo.payments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_id NVARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT,
    amount DECIMAL(15,2) NOT NULL,
    currency NVARCHAR(10) NOT NULL DEFAULT 'VND',
    status NVARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP
);

IF OBJECT_ID('dbo.payment_authorizations', 'U') IS NULL
CREATE TABLE dbo.payment_authorizations (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    authorized_amount DECIMAL(15,2) NOT NULL,
    status NVARCHAR(30) NOT NULL DEFAULT 'AUTHORIZED',
    expires_at DATETIME2,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_authorization_payment FOREIGN KEY (payment_id) REFERENCES dbo.payments(id) ON DELETE CASCADE
);

IF OBJECT_ID('dbo.refunds', 'U') IS NULL
CREATE TABLE dbo.refunds (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    refund_amount DECIMAL(15,2) NOT NULL,
    status NVARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    reason NVARCHAR(500),
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refund_payment FOREIGN KEY (payment_id) REFERENCES dbo.payments(id) ON DELETE CASCADE
);
