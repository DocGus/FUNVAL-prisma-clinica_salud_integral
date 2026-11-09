# FUNVAL Full Stack Template

Plantilla para una API base con Node.js, pnpm, TypeScript, Express 5, PostgreSQL
y Prisma ORM 7. Incluye configuración de entorno con Zod, una ruta de salud,
Swagger UI, pruebas HTTP/unitarias con Vitest y Supertest, y una prueba de
conexión PostgreSQL opcional.

## Requisitos

- Node.js `>=20.19.0`.
- pnpm `12.18.0` (versión fijada en el proyecto).
- PostgreSQL disponible solo si se ejecuta la prueba de integración o se
  conecta la aplicación a una base.

## Instalación y configuración

```sh
pnpm install
cp .env.example .env
```

Configura `DATABASE_URL` en `.env` para la conexión de la aplicación. No
compartas ni publiques `.env`.

```sh
pnpm prisma:generate
pnpm dev
```

La API ofrece `GET /health` y la documentación en
`http://localhost:3000/api/docs`.

## Variables de entorno

- `DATABASE_URL`: URL obligatoria para la configuración normal de la aplicación
  y Prisma.
- `TEST_DATABASE_URL`: URL opcional, utilizada únicamente por
  `pnpm test:integration`. Debe apuntar a una base PostgreSQL **exclusiva para
  pruebas** y el nombre de la base debe terminar en `_test`. No se utiliza como
  alternativa a `DATABASE_URL`.
- `PORT`: puerto HTTP (por defecto `3000`).
- `NODE_ENV`: `development`, `test` o `production` (por defecto `development`).

La prueba PostgreSQL solo conecta con `TEST_DATABASE_URL`, ejecuta
`SELECT 1 AS result` y desconecta. No aplica migraciones ni modifica tablas o
datos.

## Comandos

```sh
pnpm test                 # Pruebas unitarias y HTTP; no requiere PostgreSQL
pnpm test:integration     # Conexión y SELECT 1; requiere TEST_DATABASE_URL
pnpm typecheck            # Genera Prisma Client y verifica tipos
pnpm build                # Genera Prisma Client y compila solo código de producción
pnpm start                # Ejecuta dist/src/server.js después del build
pnpm prisma:generate      # Genera Prisma Client desde prisma/schema.prisma
```

## Estructura inicial

- `src/`: aplicación Express y configuración.
- `tests/`: pruebas unitarias, HTTP e integración PostgreSQL.
- `prisma/`: esquema/configuración Prisma de producción.
- `generated/`: clientes Prisma generados localmente; ignorados por Git.
- `docs/06.0_architecture.md`: arquitectura, configuración y flujo de trabajo.

El esquema de producción empieza sin modelos de negocio ni migraciones de
dominio. Al derivar un proyecto, agrega ahí únicamente sus modelos y administra
sus migraciones con el proceso apropiado para ese proyecto.

Consulta [docs/06.0_architecture.md](./docs/06.0_architecture.md) para el manual
técnico.
