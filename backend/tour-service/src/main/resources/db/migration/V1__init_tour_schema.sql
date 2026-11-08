CREATE TABLE IF NOT EXISTS destinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INT NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tours_destination FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_departures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_id BIGINT NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_departures_tour FOREIGN KEY (tour_id) REFERENCES tours (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    departure_id BIGINT NOT NULL,
    seats_booked INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservations_departure FOREIGN KEY (departure_id) REFERENCES tour_departures (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Seed Data
INSERT INTO destinations (name, city, country, description) VALUES
('Ha Long Bay', 'Quang Ninh', 'Vietnam', 'World Natural Heritage with thousands of limestone karsts'),
('Da Nang Beach & Ba Na Hills', 'Da Nang', 'Vietnam', 'Dynamic coastal city with Golden Bridge'),
('Phu Quoc Island', 'Kien Giang', 'Vietnam', 'Tropical paradise island with white sand beaches');

INSERT INTO tours (destination_id, title, description, duration_days, base_price, status, created_by) VALUES
(1, 'Ha Long Bay 2D1N Luxury Cruise', 'Discover limestone caves and luxury overnight cruise', 2, 2500000.00, 'PUBLISHED', 1),
(2, 'Da Nang - Hoi An - Ba Na Hills 3D2N', 'Explore ancient town and modern bridges', 3, 3800000.00, 'PUBLISHED', 1),
(3, 'Phu Quoc Sunset & Coral Diving 4D3N', 'Relax on emerald waters and dive into coral reefs', 4, 4900000.00, 'PUBLISHED', 1);

INSERT INTO tour_departures (tour_id, departure_date, return_date, price, total_seats, available_seats, status) VALUES
(1, '2026-12-01', '2026-12-02', 2500000.00, 30, 30, 'SCHEDULED'),
(1, '2026-12-15', '2026-12-16', 2600000.00, 30, 28, 'SCHEDULED'),
(2, '2026-12-05', '2026-12-07', 3800000.00, 25, 25, 'SCHEDULED'),
(3, '2026-12-10', '2026-12-13', 4900000.00, 20, 20, 'SCHEDULED');
