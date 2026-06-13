-- Migración para agregar columnas de rol, membresía y tiempo restante a la tabla usuarios
ALTER TABLE usuarios
  ADD COLUMN rol VARCHAR(50) NOT NULL DEFAULT 'cliente',
  ADD COLUMN membresia VARCHAR(50) NOT NULL DEFAULT 'basica',
  ADD COLUMN tiempo_restante INT NOT NULL DEFAULT 0;
