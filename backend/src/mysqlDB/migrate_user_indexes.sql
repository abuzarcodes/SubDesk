-- SubDesk: Customer-side performance indexes
-- Run: mysql -u root -p subdeskdb < migrate_user_indexes.sql

-- Index for customer subscription lookups filtered by status
CREATE INDEX idx_subscriptions_customer_status
  ON subscriptions(customer_id, status);

-- Index for expiry-based queries (upcoming payments, expired sync)
CREATE INDEX idx_subscriptions_expires_at
  ON subscriptions(expires_at);

-- Index for payment lookups by subscription
CREATE INDEX idx_payments_subscription_id
  ON payments(subscription_id);

-- Index for subscription_events sorted by date (activity feeds)
CREATE INDEX idx_sub_events_created
  ON subscription_events(subscription_id, created_at);
