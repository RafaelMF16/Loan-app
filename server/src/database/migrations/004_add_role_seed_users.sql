ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin'));

INSERT INTO users (name, email, password, role)
VALUES
  (
    'Administrador',
    'admin@loanapp.com',
    '$2b$10$FjgwYVAnDhO82dnrstRKWeGpae8l4CkDpHxnQrlSWi2q9rgJBJCVq',
    'admin'
  ),
  (
    'Usuario Teste',
    'usuario@loanapp.com',
    '$2b$10$Y06m7YhUcTAs9wARKOPDx.9S7aPHppKdEAwJ1pRbHMKJ27iZVaCYW',
    'user'
  )
ON CONFLICT (email) DO NOTHING;
