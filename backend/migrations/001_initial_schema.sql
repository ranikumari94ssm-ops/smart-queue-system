-- Safe to run after confirming the target is the existing smart_queue database.
-- This migration creates missing objects only; it never drops data, tables, volumes, or databases.
CREATE TABLE IF NOT EXISTS queues (
  id BIGSERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, code VARCHAR(20) NOT NULL UNIQUE,
  average_service_minutes INTEGER NOT NULL DEFAULT 5 CHECK (average_service_minutes > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS counters (
  id BIGSERIAL PRIMARY KEY, queue_id BIGINT NOT NULL REFERENCES queues(id) ON DELETE RESTRICT,
  name VARCHAR(80) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(queue_id,name)
);
CREATE TABLE IF NOT EXISTS tickets (
  id BIGSERIAL PRIMARY KEY, queue_id BIGINT NOT NULL REFERENCES queues(id) ON DELETE RESTRICT,
  token_number INTEGER NOT NULL CHECK(token_number > 0), customer_name VARCHAR(120) NOT NULL, customer_phone VARCHAR(30),
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting','serving','completed','cancelled','no_show')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), called_at TIMESTAMPTZ, service_started_at TIMESTAMPTZ, service_ended_at TIMESTAMPTZ,
  UNIQUE(queue_id,token_number)
);
CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY, ticket_id BIGINT NOT NULL UNIQUE REFERENCES tickets(id) ON DELETE RESTRICT,
  counter_id BIGINT NOT NULL REFERENCES counters(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK(status IN ('in_progress','completed','cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), ended_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS tickets_waiting_order_idx ON tickets(queue_id,token_number) WHERE status='waiting';
CREATE INDEX IF NOT EXISTS services_active_counter_idx ON services(counter_id) WHERE status='in_progress';
