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

Se utilizará una arquitectura **MVC modular por capas**, complementada con servicios y middlewares. Al ser una API, las respuestas HTTP/JSON cumplen el papel de salida para los clientes en lugar de vistas HTML tradicionales.

- **Routes:** definen los endpoints.
- **Middlewares:** autenticación, autorización y validaciones.
- **Controllers:** reciben solicitudes y construyen respuestas HTTP.
- **Services:** implementan las reglas de negocio y coordinan operaciones.
- **Models:** encapsulan las consultas y operaciones de persistencia.
- **Prisma:** define el esquema, genera los tipos y el cliente de base de datos utilizado por los modelos.
- **Schemas:** validan los datos de entrada con Zod.
- **Config:** centraliza variables de entorno y conexiones.

Los servicios no acceden directamente a Prisma: invocan la capa `models/`, que contiene las operaciones de persistencia. Prisma ya genera los modelos y tipos a partir de `prisma/schema.prisma`; la carpeta `models/` es una capa propia de acceso a datos y no duplica esas definiciones.

Esta separación sigue la recomendación de organizar los modelos en una carpeta `models/` y mantiene las responsabilidades claras: los controladores gestionan HTTP, los servicios aplican reglas de negocio y los modelos encapsulan las consultas con Prisma. También facilita probar servicios y persistencia de forma independiente. La estructura puede ampliarse por módulo conforme se agreguen funcionalidades.

Módulos funcionales: Auth, Users, Patients, Doctors, Specialties, Appointments y Reports.

### Tecnologías

Node.js, TypeScript, Express 5, PostgreSQL, Prisma ORM 7, Zod, Vitest, Supertest y Swagger UI. JWT y bcryptjs forman parte de las decisiones previstas para el módulo de autenticación; su integración se realizará durante esa etapa.

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

## 9. Adaptaciones respecto a los ejercicios de FUNVAL

Este proyecto toma como referencia los ejercicios prácticos desarrollados durante el programa FullStack FUNVAL. Sus ejemplos se adaptan a las tecnologías, arquitectura y reglas de negocio definidas para Clínica Salud Integral, en lugar de copiarse sin considerar el contexto.

El objetivo es aplicar los conceptos aprendidos en un sistema más cercano a una aplicación real, conservando la coherencia del código y evitando cambios arquitectónicos que no aporten valor.

### 9.1. Identificadores UUID

Los ejercicios de referencia pueden utilizar identificadores numéricos. En este proyecto, los modelos de Prisma definen los identificadores como UUID (`String` en TypeScript y `@db.Uuid` en PostgreSQL).

Los UUID no dependen de una secuencia numérica y son menos predecibles que los identificadores incrementales. Esto no sustituye la autenticación ni la autorización.

### 9.2. Nomenclatura de la fecha de la cita

En lugar de `scheduledAt`, el modelo utiliza `startAt` para identificar la fecha y hora de inicio de una cita. Esta denominación coincide con el modelo de datos del proyecto y se persiste como `DateTime` con zona horaria en PostgreSQL.

### 9.3. Nombre del campo de contraseña

El modelo `User` utiliza `passwordHash` para expresar que se almacenará un hash, no la contraseña original. El campo ya está definido en el esquema Prisma; el algoritmo y el flujo de hashing se integrarán con el módulo de autenticación. Nunca se almacenarán contraseñas en texto plano.

### 9.4. Convenciones de nomenclatura de archivos

Los ejercicios pueden usar nombres como `patient.model.ts`, `auth.middleware.ts` y `auth.routes.ts`. El proyecto conserva la convención existente, por ejemplo `patientsModel.ts`, `patientsService.ts` y `patientsController.ts`.

Ambas convenciones son válidas; mantener una nomenclatura uniforme dentro del repositorio facilita la lectura y el mantenimiento.

### 9.5. Exportación de Prisma

La instancia compartida de Prisma se exporta con nombre (`prisma`) desde `src/config/prisma.ts`. Se conserva esta convención en lugar de cambiarla a una exportación predeterminada, para mantener consistentes las importaciones existentes.

### 9.6. Registro y administración de cuentas

El diseño del sistema no contempla un endpoint de registro público. Las cuentas serán creadas por GERENCIA según las reglas de negocio; la primera cuenta GERENCIA se provisionará mediante un procedimiento controlado de inicialización.

La creación de cuentas y el flujo de inicialización son decisiones de arquitectura previstas; sus endpoints y proceso se implementarán en la etapa correspondiente.

### 9.7. Relación entre usuarios y médicos

`User` y `Doctor` representan conceptos distintos: una cuenta de acceso y un registro profesional. El esquema Prisma incorpora una relación opcional mediante `doctorId`, con unicidad para que un médico no tenga más de una cuenta. Las reglas requieren que las cuentas `MEDICO` tengan un médico asociado y que los demás roles no lo tengan.

### 9.8. Configuración de JWT

La configuración existente centraliza y valida variables de entorno con Zod mediante `src/config/env.ts`. Cuando se implemente JWT, `JWT_SECRET` deberá incorporarse a ese esquema; actualmente esa variable y el flujo de autenticación aún no están implementados.

### 9.9. Documentación de seguridad en Swagger

Swagger UI ya está integrado para servir la documentación de la API. El diseño arquitectónico prevé documentar las rutas protegidas con OpenAPI HTTP Bearer para JWT; el esquema de seguridad y las rutas autenticadas se completarán junto con el módulo de autenticación.

### 9.10. Integración de middlewares

La arquitectura prevista organiza rutas, middlewares, controladores, servicios y modelos por responsabilidad. Los middlewares de autenticación y autorización se integrarán en las rutas protegidas al implementar los módulos correspondientes; las rutas actuales de pacientes todavía no representan ese flujo completo.

### Criterio general de adaptación

Los ejercicios de FUNVAL sirven como referencia de aprendizaje e implementación. Se conservan las decisiones de arquitectura, nomenclatura, seguridad y reglas de negocio del proyecto cuando son coherentes con sus objetivos. Las adaptaciones permiten integrar los conocimientos del curso manteniendo la consistencia, la mantenibilidad y la evolución del sistema.