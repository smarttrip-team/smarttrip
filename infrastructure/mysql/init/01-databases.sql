-- =========================================================================
-- SmartTrip Platform - Initial Database Setup
-- Architecture Pattern: Database per Service
-- MySQL hosts: user-service, tour-service, hotel-service, booking-service
-- Microsoft SQL Server hosts: payment-service (smarttrip_payment_db)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `smarttrip_user_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `smarttrip_tour_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `smarttrip_hotel_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `smarttrip_booking_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant permissions for smarttrip application user
GRANT ALL PRIVILEGES ON `smarttrip_user_db`.* TO 'smarttrip'@'%';
GRANT ALL PRIVILEGES ON `smarttrip_tour_db`.* TO 'smarttrip'@'%';
GRANT ALL PRIVILEGES ON `smarttrip_hotel_db`.* TO 'smarttrip'@'%';
GRANT ALL PRIVILEGES ON `smarttrip_booking_db`.* TO 'smarttrip'@'%';

FLUSH PRIVILEGES;
