# FUNVAL — Full Stack Project Template with Prisma

## 1. Overview

This template provides a consistent starting point and working methodology for
analyzing, designing, implementing, documenting, and validating Full Stack
projects that use a REST API and a relational database.

The runnable base is an API built with Node.js, pnpm, TypeScript, Express 5,
PostgreSQL, and Prisma ORM 7. It includes environment validation with Zod,
Swagger UI documentation, HTTP/unit tests with Vitest and Supertest, and an
optional PostgreSQL integration test.

The template is intended for FUNVAL academic exercises and derived projects.
It starts without domain models, domain migrations, business rules, or
authentication. Projects add those elements according to their requirements.
The methodology encourages understanding the problem before implementation
and keeping business needs, data design, and technical decisions distinct.

## 2. Technologies and tools

### Backend and testing

- **Node.js:** JavaScript runtime; requires `>=20.19.0`.
- **pnpm:** package manager; version `12.18.0` is pinned in the project.
- **TypeScript:** statically typed application language.
- **Express 5:** HTTP server framework and middleware.
- **Zod:** validates environment configuration and can be used for future
  request schemas.
- **Prisma ORM 7:** schema, generated client, and migration tooling for derived
  projects.
- **Vitest and Supertest:** unit and HTTP testing.
- **Swagger UI:** serves the current basic OpenAPI document.

JWT authentication and password hashing are not implemented or installed.
They may be considered as optional future functionality in a derived project.

### Database

- **PostgreSQL:** relational database provider.
- **Prisma Schema:** describes the data models for a specific derived project.
- **Prisma Client:** generated TypeScript client.
- **Prisma Migrate:** available to manage schema changes when a derived project
  adds models and migrations.

### Design and documentation

- **DBML:** language for representing relational models.
- **Mermaid and ERD tools:** diagramming entity relationships.
- **Markdown:** technical and methodological documentation.

Visual Studio Code, Git, GitHub, and Docker may be used as development tools;
Docker is optional and is not required by the application.

## 3. Project structure

```text
.
├── docs/                       Academic and technical documentation
├── generated/                  Locally generated Prisma clients (Git-ignored)
├── prisma/
│   ├── migrations/             Empty of domain migrations initially
│   └── schema.prisma           PostgreSQL provider and client generator
├── src/
│   ├── config/
│   │   ├── env.schema.ts       Zod environment schema
│   │   ├── env.ts              Loads .env and validates configuration
│   │   └── prisma.ts           Production/application Prisma client
│   ├── app.ts                  Express app, health route, and Swagger UI
│   ├── server.ts               Starts the HTTP server
│   └── controllers/            ┐
│       middlewares/            │ Prepared for derived project code
│       routes/                 │ (currently empty placeholders)
│       schemas/                │
│       services/               │
│       utils/                  ┘
├── tests/
│   ├── integration/            PostgreSQL connection test (SELECT 1)
│   ├── support/                Test client factory and URL validation
│   └── *.test.ts               Unit, HTTP, and isolation tests
├── .env.example                Environment variable template, no secrets
├── .gitignore                  Excludes secrets and generated artifacts
├── package.json                Dependencies and scripts
├── pnpm-lock.yaml              Reproducible dependency resolution
├── prisma7.config.ts           Prisma CLI configuration
├── tsconfig.json               Typecheck configuration
├── tsconfig.build.json         Production-only TypeScript build
├── vitest.config.ts            Unit/HTTP test configuration
└── vitest.integration.config.ts PostgreSQL integration test configuration
```

The production Prisma schema deliberately starts without business models or
domain migrations. The integration test does not have a separate schema or
migration; it connects using `TEST_DATABASE_URL` and executes only
`SELECT 1 AS result`.

## 4. Development methodology

Development is organized into six general phases:

1. **Analysis:** understand the problem and identify what the system must solve.
2. **Design:** translate requirements into business rules and data models.
3. **Architecture:** define the database and API organization.
4. **Implementation:** build the backend and persistence with Prisma and
   PostgreSQL.
5. **Validation:** verify rules, constraints, queries, and endpoints.
6. **Documentation:** keep project documents current and record decisions.

### Phase 1. Requirements analysis

**Document:** `docs/00.0_requirements.md`

**Goal:** understand the client's idea and turn it into a clear, validated
specification.

Activities:

1. Consult with the client: record the idea, need, goals, existing processes,
   actors, responsibilities, and requested functionality.
2. Analyze gaps: identify missing or ambiguous information, contradictions,
   unspecified permissions, workflows, and exceptions.
3. Clarify and validate: resolve questions, define scope and responsibilities,
   and distinguish confirmed requirements, assumptions, and open issues.
4. Consolidate: document purpose, scope, actors, functional and
   non-functional requirements, constraints, and acceptance criteria.

**Expected outcome:** a clear and validated requirements document.

### Phase 2. Business rules

**Document:** `docs/01.0_business-rules.md`

Identify constraints, registration and update conditions, allowed
relationships, uniqueness and required fields, consistency requirements, and
rules to enforce in the application.

**Expected outcome:** rules that can be reflected in models, database
constraints, and backend validation.

### Phase 3. Entities and attributes

**Document:** `docs/02.0_entities-and-attributes.md`

Identify primary, independent, and dependent entities; define attribute
meaning, primary and candidate keys, required/optional/unique attributes, and
potential relationships.

**Expected outcome:** an entity and attribute catalog for the ER model.

### Phase 4. Entity-relationship model

**Document:** `docs/03.0_diagram-er.md`

Define relationships and cardinalities, associative entities, optional or
mandatory participation, and document their rationale. Check the diagram
against the requirements and business rules.

**Expected outcome:** a coherent conceptual data model.

### Phase 5. Relational model

**Document:** `docs/04.0_relation-model.dbml`

Convert entities into tables, define columns and data types, primary and
foreign keys, many-to-many relations, and integrity constraints. Represent and
visualize the result with DBML.

**Expected outcome:** a relational model describing tables, columns, keys, and
relationships.

### Phase 6. Normalization

**Document:** `docs/05.0_normalization.md`

Review functional dependencies and First, Second, and Third Normal Forms;
identify redundancy and insertion, update, and deletion anomalies; document
normalization decisions.

**Expected outcome:** a consistent and justified relational structure.

### Phase 7. System architecture

**Document:** `docs/06.0_architecture.md`

Describe the main components, backend/database relationship, layer
responsibilities, HTTP request flow, Express/Prisma/PostgreSQL connection, and
maintenance decisions.

### Phase 8. API design

**Suggested project-specific document:** API design. It is not currently
included in the template.

Define resources, endpoints, HTTP methods, parameters, inputs and responses,
status codes, protected endpoints, roles, and links to requirements and
business rules.

### Phase 9. Validation strategy

**Suggested project-specific document:** validation strategy. It is not
currently included in the template.

Identify test scenarios, request validation, database constraints, endpoint
tests, relationship checks, acceptance criteria, and authentication/permission
checks if those optional features are implemented.

## 5. System implementation

### Phase 10. Environment setup

Main files: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `.env`,
`.env.example`, and `prisma7.config.ts`.

Install dependencies, configure TypeScript and Express, configure environment
variables, and prepare Prisma's PostgreSQL adapter. Do not commit `.env` or
real credentials.

### Phase 11. Prisma model implementation

**File:** `prisma/schema.prisma`

After approving the relational design, define models, identifiers, field
types, optionality, relations, unique constraints, indexes, and enums as
required. Compare the Prisma schema with the approved relational model.

The template's production schema currently has no domain models.

### Phase 12. Database migrations

**Directory:** `prisma/migrations/`

When a derived project introduces models, generate and review migrations,
apply them to the intended database, verify the resulting structure, and
preserve migration history. This template does not run migrations as part of
its unit tests, build, or PostgreSQL integration test.

### Phase 13. Initial data

If a derived project needs seed data, prepare representative records, respect
model dependencies and integrity constraints, and make the process safe to
repeat. The template does not provide a seed script.

### Phase 14. REST API implementation

The `src/` layout provides places for routes, controllers, services, request
schemas, middleware, configuration, and utilities. Add only the layers needed
by the derived project. Authentication is not currently implemented.

### Phase 15. Prisma Client operations

Use the generated client for the operations required by the application:
create, query, update, delete, filter, paginate, load relations, aggregate, or
use transactions as appropriate. Use parameterized raw SQL only when justified.
The base API does not currently perform domain database operations.

## 6. Environment, installation, and commands

### Requirements

- Node.js `>=20.19.0`.
- pnpm `12.18.0`.
- PostgreSQL only when the application or integration test needs a database.

### Install and configure

```sh
pnpm install
cp .env.example .env
```

Configure these variables in the local `.env` file:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Required application/production Prisma connection URL. |
| `TEST_DATABASE_URL` | Optional integration-only URL. Must target a database dedicated exclusively to tests; its name must end with `_test`. It never falls back to `DATABASE_URL`. |
| `PORT` | HTTP port; defaults to `3000`. |
| `NODE_ENV` | `development`, `test`, or `production`; defaults to `development`. |

Generate Prisma Client and start the API:

```sh
pnpm prisma:generate
pnpm dev
```

### Test, typecheck, and build

```sh
pnpm test
pnpm test:integration
pnpm typecheck
pnpm build
pnpm start
```

- `pnpm test`: unit, environment, production-boundary, and HTTP/Supertest tests;
  no PostgreSQL connection is required.
- `pnpm test:integration`: generates the production-schema client and runs the
  PostgreSQL connection test using only `TEST_DATABASE_URL`. It executes
  `SELECT 1 AS result`, disconnects in `finally`, and performs no migrations or
  writes.
- `pnpm typecheck`: generates Prisma Client and checks production and test
  TypeScript without emitting output.
- `pnpm build`: generates Prisma Client and compiles production code only.
- `pnpm start`: runs `dist/src/server.js` after a successful build.
- `pnpm prisma:generate`: generates Prisma Client from `prisma/schema.prisma`.

The API exposes `GET /health` and Swagger UI at `/api/docs` (default base URL:
`http://localhost:3000`).

## 7. Recommended implementation order

| Order | Activity | Tool or artifact |
|---|---|---|
| 1 | Configure the environment | Node.js and TypeScript |
| 2 | Design requirements and data | Documentation and PostgreSQL concepts |
| 3 | Configure PostgreSQL and Prisma | Prisma ORM |
| 4 | Define project models and migrations | Prisma Schema and Prisma Migrate |
| 5 | Add initial data if needed | Project-specific seed |
| 6 | Implement routes and controllers | Express |
| 7 | Implement application logic | Services and Prisma Client |
| 8 | Validate input | Zod |
| 9 | Add optional security features if needed | Authentication and password hashing |
| 10 | Run tests and checks | Vitest, Supertest, typecheck, build |
| 11 | Document the API | Swagger/OpenAPI |

Adapt this order to the scope and requirements of each project.

## 8. Project validation checklist

### Analysis and design

- [ ] Requirements and business rules are documented.
- [ ] Entities, attributes, ER and relational models are consistent.
- [ ] Normalization, architecture, API, and validation strategy are documented.

### Implementation

- [ ] Environment and dependencies are configured.
- [ ] `DATABASE_URL` is valid for the intended application environment.
- [ ] Integration testing, if used, has a dedicated `TEST_DATABASE_URL` ending
  in `_test`.
- [ ] Project models and migrations match the approved design.
- [ ] Endpoints, validations, and business rules behave as expected.
- [ ] Optional authentication/authorization is tested only if implemented.
- [ ] `pnpm test`, `pnpm typecheck`, and `pnpm build` pass.
- [ ] Documentation is current.

## 9. Version control and working principles

Use version control to track project changes, but never commit `.env`,
credentials, or sensitive information. Keep the lockfile with dependency
changes.

- Understand the problem before designing data.
- Justify design decisions and keep models aligned with requirements.
- Document each stage and separate relational design from Prisma
  implementation.
- Avoid unnecessary entities, attributes, rules, layers, and dependencies.
- Use migrations to manage derived-project schema changes.
- Validate in the application and database where appropriate.
- Keep backend responsibilities clear and verify functionality with tests.

## 10. Author

**Gustavo Andrés Santoyo Benavides**

FUNVAL — Full Stack Development

Database Design and Full Stack API Implementation Practice.
