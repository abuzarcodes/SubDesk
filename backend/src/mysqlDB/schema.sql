-- SubDesk Database Schema
-- Run this against your MySQL database:
-- mysql -u root -p subdeskdb < schema.sql

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
  status ENUM('active','paused','cancelled','expired','inactive') NOT NULL DEFAULT 'active',
  started_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  paused_at TIMESTAMP NULL DEFAULT NULL,
  resumed_at TIMESTAMP NULL DEFAULT NULL,
  cancelled_at TIMESTAMP NULL DEFAULT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS business_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL UNIQUE,
  slug VARCHAR(255) UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255),
  tagline VARCHAR(255),
  support_email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
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

-- Subscription audit trail
CREATE TABLE IF NOT EXISTS subscription_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subscription_id INT NOT NULL,
  event_type ENUM('created','paused','resumed','cancelled','expired') NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX idx_subscriptions_business_status ON subscriptions(business_id, status);
CREATE INDEX idx_subscriptions_dates           ON subscriptions(started_at, cancelled_at);
CREATE INDEX idx_sub_plan_id                  ON subscriptions(plan_id);
CREATE INDEX idx_sub_is_deleted               ON subscriptions(is_deleted);
CREATE INDEX idx_events_type_date              ON subscription_events(subscription_id, event_type, created_at);
CREATE INDEX idx_events_subscription_id       ON subscription_events(subscription_id);
CREATE INDEX idx_plans_business               ON plans(business_id);
