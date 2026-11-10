[![CI/CD Pipeline](https://github.com/xMichaelz/Lab-2---2026-2/actions/workflows/build.yml/badge.svg)](https://github.com/xMichaelz/Lab-2---2026-2/actions/workflows/build.yml)

# lab12026p — Laboratorio 1: Introducción a Spring Boot

Aplicación bancaria sencilla con backend REST en Spring Boot y frontend React (Vite + Axios).

## Objetivo

Permitir:

- Crear y consultar clientes/cuentas
- Realizar transferencias entre cuentas
- Consultar el historial de transacciones por cuenta

## Arquitectura

```
React (Vite)  →  Axios  →  Spring Boot Controllers
                                ↓
                            Services
                                ↓
                            Repositories (Spring Data JPA)
                                ↓
                            MySQL (lab12026p)
```

Capas del backend:

- Entity
- DTO
- Mapper (MapStruct)
- Repository
- Service
- Controller

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Backend | Java 17, Spring Boot 3.5.x |
| Persistencia | Spring Data JPA / Hibernate |
| Base de datos | MySQL 8 |
| Mapeo | MapStruct |
| Frontend | React, Vite, Axios, React Router |
| Estilos | CSS moderno (tema dark cozy) |

## Requisitos

- JDK 17 (recomendado; el `pom.xml` declara Java 17)
- Maven Wrapper incluido (`./mvnw`)
- MySQL 8 escuchando en `localhost:3306`
- Node.js 18+ y npm (para el frontend)

## Configuración de MySQL

1. Asegúrate de que MySQL esté en ejecución.
2. Crea la base de datos (opcional; Hibernate también puede crearla):

```sql
CREATE DATABASE IF NOT EXISTS lab12026p;
```

3. Configura las credenciales en `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lab12026p?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=<TU_PASSWORD>
spring.jpa.hibernate.ddl-auto=update
```

> No subas contraseñas reales al repositorio. Usa tu contraseña local en `application.properties` o variables de entorno según tu entorno.

Las tablas `customers` y `transactions` se crean/actualizan automáticamente con Hibernate (`ddl-auto=update`).

## Cómo ejecutar el backend

Desde la raíz del proyecto:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)   # macOS, si tienes varias JDKs
./mvnw spring-boot:run
```

El API queda disponible en:

```
http://localhost:8080
```

## Cómo ejecutar el frontend

```bash
cd frontend
npm install
npm run dev
```

Abre:

```
http://localhost:5173
```

Build de producción:

```bash
cd frontend
npm run build
```

## Endpoints

### Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/customers` | Listar clientes |
| GET | `/api/customers/{id}` | Obtener cliente por ID |
| POST | `/api/customers` | Crear cliente |

Ejemplo de cuerpo (POST):

```json
{
  "firstName": "Ana",
  "lastName": "Perez",
  "accountNumber": "111111",
  "balance": 1000
}
```

### Transacciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/transactions` | Realizar transferencia |
| GET | `/api/transactions` | Listar todas las transacciones |
| GET | `/api/transactions/{id}` | Obtener transacción por ID |
| GET | `/api/transactions/account/{accountNumber}` | Historial de una cuenta |

Ejemplo de transferencia (POST):

```json
{
  "senderAccountNumber": "111111",
  "receiverAccountNumber": "222222",
  "amount": 150
}
```

### Códigos HTTP usados

- `200` OK
- `201` Created
- `400` Bad Request (validaciones / saldo insuficiente / misma cuenta)
- `404` Not Found
- `409` Conflict (cuenta duplicada)

Errores con formato:

```json
{
  "message": "La cuenta origen y destino deben ser diferentes.",
  "status": 400,
  "timestamp": "..."
}
```

## Estructura del proyecto

```
lab12026p/
├── pom.xml
├── src/main/java/com/udea/lab12026p/
│   ├── config/          # CORS
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── exception/
│   ├── mapper/
│   ├── repository/
│   └── service/
├── src/main/resources/application.properties
├── src/test/            # Pruebas con H2 en memoria
└── frontend/            # React + Vite
    ├── src/api/
    ├── src/components/
    ├── src/pages/
    └── src/utils/
```

## Vistas del frontend

1. **Clientes** — listado en tarjetas + formulario de creación
2. **Transferir** — selección de cuentas y monto
3. **Historial** — movimientos ENVIADO / RECIBIDO por cuenta

CORS está habilitado para `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000` y `http://127.0.0.1:3000`.

## Cómo probar

### Pruebas automatizadas (backend)

Usan H2 en memoria (no afectan MySQL):

```bash
./mvnw test
```

Cubren: crear/consultar clientes, transferencia exitosa, saldo insuficiente, cuenta inexistente, misma cuenta, cuenta duplicada e historial.

### Prueba manual contra MySQL

1. Arranca el backend (`./mvnw spring-boot:run`).
2. Crea dos clientes:

```bash
curl -s -X POST http://localhost:8080/api/customers \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Ana","lastName":"Perez","accountNumber":"111111","balance":1000}'

curl -s -X POST http://localhost:8080/api/customers \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Luis","lastName":"Gomez","accountNumber":"222222","balance":200}'
```

3. Transfiere 150:

```bash
curl -s -X POST http://localhost:8080/api/transactions \
  -H 'Content-Type: application/json' \
  -d '{"senderAccountNumber":"111111","receiverAccountNumber":"222222","amount":150}'
```

4. Verifica saldos (Ana 850, Luis 350) e historial:

```bash
curl -s http://localhost:8080/api/customers
curl -s http://localhost:8080/api/transactions/account/111111
```

5. Reinicia el backend y vuelve a consultar para confirmar persistencia.

### Frontend

1. Backend en `8080`
2. `cd frontend && npm run dev`
3. Probar las tres vistas en el navegador

## Notas

- La aplicación de ejecución normal usa **MySQL real**, no H2.
- H2 se usa **solo** en pruebas automatizadas (`src/test/resources`).
- No se requiere Docker para este laboratorio.
