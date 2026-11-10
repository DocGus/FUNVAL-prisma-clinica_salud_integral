# Clínica Salud Integral — API REST

## 1. Caso de negocio

Clínica Salud Integral administra pacientes, médicos y citas mediante hojas de cálculo. Este método provoca pérdida de información, duplicidad de registros y conflictos de horarios.

**Solución:** desarrollar una API REST que centralice la información clínica y la gestión de citas, controle la disponibilidad de médicos y pacientes, y proporcione información para la toma de decisiones de gerencia.

## 2. Decisiones acordadas con el cliente

Para convertir el enunciado inicial en un sistema desarrollable, se definieron las siguientes condiciones:

- Cada cita dura **30 minutos**.
- Cada médico pertenece a una sola especialidad.
- Una cita requiere un paciente y un médico existentes.
- No se permiten horarios traslapados para un médico ni para un paciente.
- Se permiten citas consecutivas.
- Las citas canceladas liberan el horario; las programadas y completadas lo ocupan.
- Toda cita comienza como `PROGRAMADA` y solo puede cambiar a `COMPLETADA` o `CANCELADA`.
- Los estados finales no pueden modificarse.
- La inasistencia se registra como `CANCELADA`.
- Las fechas se interpretan en `America/Mexico_City` y se almacenan como instantes UTC.
- RECEPCIONISTA registra pacientes y programa citas; MEDICO consulta su agenda y actualiza sus citas; GERENCIA administra médicos, especialidades y usuarios, y consulta reportes.
- No existe registro público de usuarios. GERENCIA crea las cuentas y la primera cuenta se aprovisiona mediante un procedimiento controlado.
- Los reportes incluyen el volumen de citas por especialidad y el corte diario de citas completadas y canceladas.

## 3. Reglas de negocio

- Pacientes: nombre, apellido, correo y fecha de nacimiento obligatorios; teléfono opcional. El correo es único.
- Médicos: nombre, apellido, cédula profesional y especialidad obligatorios; correo opcional. La cédula es única.
- Especialidades: nombre obligatorio y único.
- Usuarios: correo único, contraseña almacenada como hash y rol obligatorio. Las cuentas MEDICO deben vincularse con un médico existente; cada médico puede tener como máximo una cuenta.
- Citas: duración fija de 30 minutos, inicio no pasado y sin traslapes para paciente o médico.
- Estados: `PROGRAMADA`, `COMPLETADA` y `CANCELADA`, con transiciones controladas.
- Acceso: autenticación JWT, permisos por rol y restricción de los médicos a sus propias citas.
- Agenda: rango inicial inclusivo y final exclusivo.
- Corte diario: día calendario de Ciudad de México; contabiliza únicamente citas `COMPLETADA` y `CANCELADA`.

## 4. Modelo de datos

Se utilizarán cinco entidades:

| Entidad / tabla | Atributos principales |
|---|---|
| Patient / `patients` | id, firstName, lastName, email, birthDate, phone |
| Doctor / `doctors` | id, firstName, lastName, professionalLicense, email, specialtyId |
| Specialty / `specialties` | id, name |
| Appointment / `appointments` | id, patientId, doctorId, startAt, status |
| User / `users` | id, email, passwordHash, role, doctorId |

La duración de la cita es fija y su hora de finalización se calcula a partir de `startAt`; no se almacena como atributo independiente.

### Relaciones y cardinalidades

- `Specialty 1:N Doctor`: una especialidad puede tener varios médicos; cada médico pertenece a una especialidad.
- `Patient 1:N Appointment`: un paciente puede tener varias citas; cada cita corresponde a un paciente.
- `Doctor 1:N Appointment`: un médico puede atender varias citas; cada cita corresponde a un médico.
- `Doctor 1:0..1 User`: un médico puede tener como máximo una cuenta; las cuentas con rol MEDICO requieren un médico asociado.
- `Appointment` relaciona pacientes y médicos, resolviendo la relación muchos a muchos a través del historial de citas.

## 5. Arquitectura de la aplicación

Se utilizará una arquitectura **MVC modular con capa de servicios**:

- **Routes:** definen los endpoints.
- **Middlewares:** autenticación, autorización y validaciones.
- **Controllers:** reciben solicitudes y construyen respuestas HTTP.
- **Services:** implementan las reglas de negocio y coordinan operaciones.
- **Models / Prisma:** gestionan el acceso y persistencia de datos.
- **Schemas:** validan los datos de entrada con Zod.

Módulos funcionales: Auth, Users, Patients, Doctors, Specialties, Appointments y Reports.

### Tecnologías

Node.js, TypeScript, Express 5, PostgreSQL, Prisma ORM 7, Zod, JWT, bcryptjs, Vitest, Supertest y Swagger UI.

Las operaciones de citas contemplarán validación de traslapes y protección frente a solicitudes concurrentes. Los reportes utilizarán consultas especializadas de Prisma y SQL parametrizado cuando corresponda.

## 6. Plantilla técnica del proyecto

El desarrollo parte de una **plantilla Full Stack propia**, creada para estandarizar el inicio de APIs REST con Node.js y TypeScript.

Incluye configuración de entorno, conexión PostgreSQL, Prisma ORM 7, ruta de salud (`GET /health`), documentación Swagger UI, pruebas con Vitest y Supertest, scripts de desarrollo y compilación, y estructura modular inicial.

La plantilla proporciona la infraestructura técnica; sobre ella se incorporarán los modelos, migraciones, módulos y reglas de negocio de Clínica Salud Integral.

## 7. Instalación y ejecución

### Requisitos

- Node.js `>=20.19.0`.
- pnpm `12.18.0`.
- PostgreSQL para la persistencia de la aplicación.

### Configuración

```bash
pnpm install
cp .env.example .env
```

Configurar `DATABASE_URL` en `.env`. No publicar credenciales ni archivos de entorno.

```bash
pnpm prisma:generate
pnpm dev
```

API: `http://localhost:3000`

Documentación: `http://localhost:3000/api/docs`

### Comandos principales

```bash
pnpm dev                 # Desarrollo
pnpm test                # Pruebas unitarias y HTTP
pnpm test:integration    # Prueba de conexión PostgreSQL
pnpm typecheck           # Verificación de tipos
pnpm build               # Compilación
pnpm start               # Ejecución de producción
pnpm prisma:generate     # Generación de Prisma Client
```

La integración utiliza `TEST_DATABASE_URL`, que debe apuntar exclusivamente a una base de pruebas cuyo nombre termine en `_test`.

## 8. Documentación del proyecto

El análisis y diseño se encuentra en `docs/`:

- `00.0_requirements.md`: requerimientos funcionales y alcance.
- `01.0_business-rules.md`: reglas de negocio.
- `02.0_entities-and-attributes.md`: entidades y atributos.
- `03.0_diagram-er.md`: modelo entidad-relación.
- `04.0_relation-model.dbml`: modelo relacional.
- `05.0_normalization.md`: análisis de normalización.
- `06.0_architecture.md`: arquitectura y decisiones técnicas.