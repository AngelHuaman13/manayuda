-- ManaYuda: datos de ejemplo para desarrollo
-- Ejecutar UNA sola vez, sobre la base recién creada con manayuda.sql
-- Contraseña de las dos cuentas demo: clave12345  (solo para pruebas locales)

USE manayuda;

-- Cuentas demo
INSERT INTO usuario (nombre, email, password_hash, rol) VALUES
  ('Donante Demo', 'donante.demo@manayuda.pe',
   '$2a$10$ftFKUsDA6KBOfBPYCnYzaemRO1bVUXLlu3cZ7MKLv5AdDc5E5L7Qi', 'DONANTE'),
  ('Comedor Demo', 'comedor.demo@manayuda.pe',
   '$2a$10$ftFKUsDA6KBOfBPYCnYzaemRO1bVUXLlu3cZ7MKLv5AdDc5E5L7Qi', 'COMEDOR');

SET @donante = (SELECT id_usuario FROM usuario WHERE email = 'donante.demo@manayuda.pe');
SET @resp    = (SELECT id_usuario FROM usuario WHERE email = 'comedor.demo@manayuda.pe');

-- Comedores
INSERT INTO comedor (id_usuario, nombre, direccion, distrito, telefono, personas_atendidas) VALUES
  (@resp, 'Comedor Virgen del Carmen', 'Av. Central 123, Sector 2', 'Villa El Salvador', '987654321', 60),
  (@resp, 'Comedor Santa Rosa', 'Mz. B Lt. 12, Sector 3', 'Villa El Salvador', '912345678', 45);

-- Donaciones (los vencimientos son relativos a hoy, para que no caduquen)
INSERT INTO donacion (id_usuario, producto, cantidad, unidad, fecha_vencimiento, estado) VALUES
  (@donante, 'Arroz',    25, 'kg', DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'ENTREGADA'),
  (@donante, 'Frijol',   30, 'kg', DATE_ADD(CURDATE(), INTERVAL 120 DAY), 'ASIGNADA'),
  (@donante, 'Lentejas', 20, 'kg', DATE_ADD(CURDATE(), INTERVAL 90 DAY),  'DISPONIBLE');

SET @arroz  = (SELECT id_donacion FROM donacion WHERE producto = 'Arroz'  AND id_usuario = @donante);
SET @frijol = (SELECT id_donacion FROM donacion WHERE producto = 'Frijol' AND id_usuario = @donante);
SET @c1     = (SELECT id_comedor FROM comedor WHERE nombre = 'Comedor Virgen del Carmen');
SET @c2     = (SELECT id_comedor FROM comedor WHERE nombre = 'Comedor Santa Rosa');

-- Entregas: el arroz salió completo (10 + 15) y el frijol a medias (10 de 30)
INSERT INTO entrega (id_donacion, id_comedor, cantidad_entregada, observaciones) VALUES
  (@arroz,  @c1, 10, 'Primera entrega'),
  (@arroz,  @c2, 15, 'Entrega final'),
  (@frijol, @c1, 10, 'Primera entrega');

SELECT 'Listo: datos demo cargados' AS resultado;
