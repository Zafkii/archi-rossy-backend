-- users: administradores o staff que gestionan licencias
CREATE TABLE users (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
username TEXT UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
role TEXT NOT NULL DEFAULT 'user'
);

-- clients: quienes compran tu app
CREATE TABLE clients (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
email TEXT UNIQUE,
organization TEXT,
registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- licenses: seriales emitidos y activaciones
CREATE TABLE licenses (
id SERIAL PRIMARY KEY,
client_id INT REFERENCES clients(id) ON DELETE CASCADE,
serial TEXT UNIQUE NOT NULL,
active BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
activated_at TIMESTAMP,
expires_at TIMESTAMP,
device_id TEXT, -- opcional fingerprint o hash del equipo
ip_address TEXT
);
