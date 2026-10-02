CREATE DATABASE IF NOT EXISTS manayuda
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE manayuda;

CREATE TABLE usuario (
  id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  rol            ENUM('DONANTE','COMEDOR','ADMIN') NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comedor (
  id_comedor        INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario        INT NOT NULL,
  nombre            VARCHAR(120) NOT NULL,
  direccion         VARCHAR(200) NOT NULL,
  distrito          VARCHAR(80)  NOT NULL,
  telefono          VARCHAR(20),
  personas_atendidas INT DEFAULT 0,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE donacion (
  id_donacion       INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario        INT NOT NULL,
  producto          VARCHAR(120) NOT NULL,
  cantidad          DECIMAL(10,2) NOT NULL,
  unidad            VARCHAR(20) NOT NULL,
  fecha_vencimiento DATE,
  estado            ENUM('DISPONIBLE','ASIGNADA','ENTREGADA') DEFAULT 'DISPONIBLE',
  fecha_donacion    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE entrega (
  id_entrega        INT AUTO_INCREMENT PRIMARY KEY,
  id_donacion       INT NOT NULL,
  id_comedor        INT NOT NULL,
  cantidad_entregada DECIMAL(10,2) NOT NULL,
  fecha_entrega     DATETIME DEFAULT CURRENT_TIMESTAMP,
  observaciones     VARCHAR(255),
  FOREIGN KEY (id_donacion) REFERENCES donacion(id_donacion),
  FOREIGN KEY (id_comedor)  REFERENCES comedor(id_comedor)
);