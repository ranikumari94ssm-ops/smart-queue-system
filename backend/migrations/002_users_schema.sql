CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('User', 'Staff', 'Admin')),
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default test users (Passwords are hashed as 'password123' using a dummy hash for now, but we will use bcrypt in the app)
-- For simplicity in this demo without setting up bcrypt in SQL, we will store them as plain text. Wait, it's better to insert them via the Node backend using real bcrypt.
