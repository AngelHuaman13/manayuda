# ManayudaApp 🍲

Plataforma web que conecta **donantes** con **comedores populares** de Villa El Salvador (Lima, Perú). Los donantes registran alimentos y se asignan a los comedores que los necesitan, con control de saldo y estados.

## Funcionalidades

- Registro de usuarios con contraseña encriptada (BCrypt) y roles: donante, comedor y administrador.
- Registro de comedores populares.
- Registro de donaciones (solo usuarios con rol donante).
- Entregas parciales: cada entrega descuenta el saldo y la donación pasa de `DISPONIBLE` a `ASIGNADA` y luego a `ENTREGADA`.
- Validaciones: no se puede entregar más de lo que queda, ni una donación vencida o ya entregada.
- Interfaz web para donar, asignar entregas y ver comedores.

## Tecnologías

- Java 17+ y Spring Boot (Web, Data JPA, Validation)
- MySQL 8
- Lombok
- HTML, CSS y JavaScript

## Arquitectura

Capas: `controller` → `service` → `repository` → MySQL. Se usan DTOs para no exponer las entidades (por ejemplo, el hash de la contraseña nunca sale en las respuestas).

## Cómo ejecutarlo

1. Clona el repositorio.
2. Crea la base de datos con el script SQL (ver `database/manayuda.sql`).
3. Copia `src/main/resources/secrets.properties.example` como `secrets.properties` y pon tus credenciales de MySQL.
4. Ejecuta `ManayudaApplication` desde tu IDE o con `./mvnw spring-boot:run`.
5. Abre `http://localhost:8080`.

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/usuarios` | Registrar usuario |
| GET/POST | `/api/comedores` | Listar / crear comedores |
| GET/POST | `/api/donaciones` | Listar (filtro `?estado=`) / crear donaciones |
| GET/POST | `/api/entregas` | Listar (filtro `?idComedor=`) / registrar entregas |

## Próximos pasos

- Login y autenticación
- Editar y eliminar registros
- Panel para administradores

## Autor

**Angel Oscar Moscoso Huaman**, estudiante de Ingeniería de Software (UTP).

- GitHub: [AngelHuaman13](https://github.com/AngelHuaman13)
- Correo: mangel.roben@gmail.com