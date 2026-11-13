-- =========================================================================
-- Payment Service Migration: Filtered Unique Index (V3__filter_unique_idempotency_key.sql)
-- Database: Microsoft SQL Server (smarttrip_payment_db)
-- =========================================================================

DECLARE @ConstraintName NVARCHAR(200);
SELECT @ConstraintName = name 
FROM sys.key_constraints 
WHERE parent_object_id = OBJECT_ID('dbo.wallet_transactions') 
  AND type = 'UQ';

IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE dbo.wallet_transactions DROP CONSTRAINT ' + @ConstraintName);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'uq_wallet_transactions_idempotency_key' AND object_id = OBJECT_ID('dbo.wallet_transactions'))
BEGIN
    SET QUOTED_IDENTIFIER ON;
    CREATE UNIQUE NONCLUSTERED INDEX uq_wallet_transactions_idempotency_key 
    ON dbo.wallet_transactions(idempotency_key) 
    WHERE idempotency_key IS NOT NULL;
END;
