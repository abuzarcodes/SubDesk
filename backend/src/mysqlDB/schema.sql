-- SubTrckr Database Schema
-- Run this against your MySQL database:
-- mysql -u root -p subtrckrdb < schema.sql

-- Ensure users table has a role column
-- If your users table already exists, run:
-- ALTER TABLE users ADD COLUMN role ENUM('business','customer') NOT NULL DEFAULT 'customer';

-- If creating from scratch:
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('business','customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);-

CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle ENUM('monthly','yearly') NOT NULL DEFAULT 'monthly',
  description TEXT,
  features JSON, -- Array of features
  discount DECIMAL(5,2) DEFAULT 0.00,
  benefits_available JSON, -- Array of strings
  benefits_not_available JSON, -- Array of strings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  plan_id INT NOT NULL,
  business_id INT NOT NULL,
  start_date DATE NOT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS business_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255),
  tagline VARCHAR(255),
  support_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS page_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL UNIQUE,
  theme JSON NOT NULL,
  layout JSON NOT NULL,
  components JSON NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE
);
