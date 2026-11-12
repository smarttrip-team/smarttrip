-- =========================================================================
-- Payment Service Migration: Outbox Events & Processed Messages (V2)
-- Database: Microsoft SQL Server (smarttrip_payment_db)
-- =========================================================================

IF OBJECT_ID('dbo.outbox_events', 'U') IS NULL
CREATE TABLE dbo.outbox_events (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    aggregate_type NVARCHAR(50) NOT NULL,
    aggregate_id NVARCHAR(100) NOT NULL,
    event_type NVARCHAR(100) NOT NULL,
    payload NVARCHAR(MAX) NOT NULL,
    exchange NVARCHAR(100),
    routing_key NVARCHAR(100),
    status NVARCHAR(30) NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME2
);

IF OBJECT_ID('dbo.processed_messages', 'U') IS NULL
CREATE TABLE dbo.processed_messages (
    message_id NVARCHAR(100) NOT NULL,
    consumer_name NVARCHAR(100) NOT NULL,
    processed_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id, consumer_name)
);
