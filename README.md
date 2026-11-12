from pathlib import Path

readme = r"""# Clínica Salud Integral — API REST

## 0.0 Caso de negocio

Clínica Salud Integral requiere centralizar la información de pacientes, médicos, especialidades y citas mediante una API REST. El proyecto proporciona una base de persistencia y servicios HTTP para gestionar las operaciones contempladas en su alcance actual.

**Solución:** una API REST desarrollada con Node.js, TypeScript, Express y PostgreSQL, con acceso a datos mediante Prisma ORM. La API incorpora autenticación, autorización por roles, operaciones de citas y consultas de reportes.

La versión actual no debe describirse como un sistema integral de expediente clínico ni como un motor completo de disponibilidad: esas capacidades no están acreditadas por la implementación revisada.

## 0.1 Decisiones acordadas y alcance implementado

Las siguientes decisiones corresponden al esquema y al código revisados:

- Cada médico pertenece a una especialidad.
- Una cita requiere un paciente y un médico existentes.
- La fecha de inicio de una cita no puede estar en el pasado.
- Toda cita nueva comienza con estado `PROGRAMADA`.
- Los estados definidos son `PROGRAMADA`, `COMPLETADA` y `CANCELADA`.
- La operación de actualización de estado acepta `COMPLETADA` o `CANCELADA` como estados destino.
- El motivo de la cita (`reason`) es opcional.
- La agenda se consulta para el médico autenticado.
- Los filtros `from` y `to` se aplican como rango cuando ambos están presentes.
- Las rutas protegidas revisadas utilizan autenticación JWT y autorización por rol.
- Las operaciones de agenda y actualización de citas comprueban la pertenencia del recurso al médico autenticado.
- Los reportes revisados están restringidos al rol `GERENCIA`.


## 1.0 Reglas de negocio y permisos confirmados

- **Citas:** el paciente y el médico deben existir; la fecha debe ser futura; el estado inicial es `PROGRAMADA`; `reason` es opcional.
- **Estados:** el esquema contempla `PROGRAMADA`, `COMPLETADA` y `CANCELADA`. La validación de actualización acepta `COMPLETADA` o `CANCELADA`.
- **Agenda:** el médico consulta su propia agenda; los resultados incluyen información del paciente y se ordenan por fecha ascendente.
- **Autorización:** las rutas protegidas verifican el JWT y el rol requerido.
- **Pertenencia:** un médico no debe consultar ni actualizar citas pertenecientes a otro médico.
- **Reportes:** los endpoints de reportes revisados requieren el rol `GERENCIA`; el corte diario contabiliza citas `COMPLETADA` y `CANCELADA`.

### Roles definidos

| Rol | Responsabilidad general |
|---|---|
| `RECEPCIONISTA` | Puede programar citas y consultar el directorio médico, según las rutas revisadas. |
| `MEDICO` | Puede consultar su agenda y actualizar el estado de sus propias citas. |
| `GERENCIA` | Puede consultar los reportes gerenciales revisados. |

Esta tabla resume los permisos confirmados en las rutas inspeccionadas; no constituye una matriz exhaustiva de permisos para todos los recursos.

## 2.0 Entidades y Atributos

La base de datos utiliza cinco modelos principales:

| Modelo / tabla | Atributos principales |
|---|---|
| `Patient` / `patients` | `id`, `firstName`, `lastName`, `email`, `birthDate`, `phone` |
| `Doctor` / `doctors` | `id`, `firstName`, `lastName`, `professionalLicense`, `email`, `specialtyId` |
| `Specialty` / `specialties` | `id`, `name` |
| `Appointment` / `appointments` | `id`, `patientId`, `doctorId`, `scheduledAt`, `reason`, `status` |
| `User` / `users` | `id`, `email`, `passwordHash`, `role`, `doctorId` |

En `Appointment`, el campo Prisma `scheduledAt` se mapea a la columna física `startAt` en PostgreSQL. `reason` es opcional.

Los identificadores principales utilizan UUID.

## 4.0 Relaciones y Cardinalidades

- `Specialty 1:N Doctor`: una especialidad puede tener varios médicos; cada médico pertenece a una especialidad.
- `Patient 1:N Appointment`: un paciente puede tener varias citas; cada cita corresponde a un paciente.
- `Doctor 1:N Appointment`: un médico puede atender varias citas; cada cita corresponde a un médico.
- `Doctor 1:0..1 User`: un médico puede estar asociado como máximo a una cuenta; `User.doctorId` es opcional y único.
- `Appointment` relaciona pacientes y médicos a través de las citas.

La relación opcional entre `User` y `Doctor` se define en el esquema. La lógica de aplicación comprueba la asociación del médico autenticado para las operaciones que requieren esa pertenencia.

## 6.0 Arquitectura de la aplicación

El backend utiliza una arquitectura modular por capas:

- **Routes:** definen los endpoints y conectan las solicitudes con los controladores.
- **Middlewares:** ejecutan autenticación, autorización, validación y manejo transversal de errores.
- **Controllers:** reciben solicitudes y construyen respuestas HTTP.
- **Services:** aplican reglas de negocio y coordinan operaciones.
- **Models / acceso a datos:** encapsulan consultas y operaciones de persistencia mediante Prisma Client.
- **Prisma:** define el esquema, genera los tipos y proporciona el cliente de acceso a PostgreSQL.
- **Schemas:** validan los datos de entrada con Zod.
- **Config:** centraliza la configuración del entorno y la conexión a la base de datos.

Los modelos y tipos de las entidades se definen en `prisma/schema.prisma`. La carpeta propia `src/models/` organiza las operaciones de acceso a datos y no duplica las definiciones generadas por Prisma.

### Módulos y rutas montadas

La aplicación monta los siguientes routers y rutas:

| Prefijo o ruta | Módulo |
|---|---|
| `/api/auth` | Autenticación |
| `/api/appointments` | Citas |
| `/api/doctors` | Médicos |
| `/api/patients` | Pacientes |
| `/api/reports` | Reportes |
| `/api/specialties` | Especialidades |
| `/health` | Estado de la aplicación |
| `/api/docs` | Swagger UI |

### Endpoints específicos revisados

| Método | Endpoint | Función | Acceso confirmado |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión. | Público |
| `POST` | `/api/appointments` | Programar una cita. | `RECEPCIONISTA` |
| `PATCH` | `/api/appointments/:id/status` | Actualizar el estado de una cita. | `MEDICO` |
| `GET` | `/api/doctors` | Consultar directorio médico. | `RECEPCIONISTA` |
| `GET` | `/api/doctors/:id/appointments` | Consultar agenda de un médico. | `MEDICO`, con comprobación de pertenencia |
| `GET` | `/api/reports/appointments-by-specialty` | Consultar volumen de citas por especialidad. | `GERENCIA` |
| `GET` | `/api/reports/daily-cutoff` | Consultar corte operativo diario. | `GERENCIA` |

Los routers de pacientes y especialidades están montados. Esta documentación no atribuye operaciones CRUD ni permisos concretos que no hayan sido confirmados en sus rutas.

### Tecnologías

- Node.js
- TypeScript
- Express 5
- PostgreSQL
- Prisma ORM 7
- Zod
- JWT
- bcryptjs
- Vitest
- Supertest
- Swagger UI / OpenAPI

## 6. Plantilla técnica del proyecto

El proyecto parte de una plantilla técnica propia para APIs REST con Node.js y TypeScript.

La base incluye configuración de entorno, conexión con PostgreSQL, Prisma ORM 7, ruta de salud (`GET /health`), documentación Swagger UI, pruebas automatizadas y scripts de desarrollo y compilación.

Sobre esa estructura se implementaron los modelos, migraciones y módulos específicos de Clínica Salud Integral.

### Datos iniciales

El archivo `prisma/seed.ts` contiene un proceso de inicialización idempotente que crea o actualiza tres especialidades —Medicina General, Pediatría y Cardiología— y dos médicos por especialidad.

El seed de catálogo no debe confundirse con un proceso de creación de cuentas de usuario ni con un mecanismo de aprovisionamiento de una cuenta GERENCIA.

### Instalación y ejecución

### Requisitos

- Node.js compatible con la versión declarada en `package.json`.
- pnpm compatible con el proyecto.
- PostgreSQL para la persistencia de la aplicación.

### Configuración

```bash
pnpm install
cp .env.example .env
```

Configurar en `.env` las variables requeridas por el esquema de entorno, especialmente `DATABASE_URL` para la conexión de la aplicación y `JWT_SECRET` para la firma de tokens. No publicar credenciales ni archivos de entorno.

Para trabajar con la base de datos:

```bash
pnpm prisma:generate
```

Aplicar las migraciones con el comando de Prisma definido por el proyecto y apuntando a la base de datos correcta. No ejecutar migraciones contra una base de datos de producción sin revisar previamente el destino.

Iniciar el servidor en desarrollo:

```bash
pnpm dev
```

Por defecto, la API se documenta para ejecutarse en:

- API: `http://localhost:3000`
- Documentación: `http://localhost:3000/api/docs`
- Salud: `http://localhost:3000/health`

El puerto efectivo depende de la configuración del entorno.

### Comandos principales

```bash
pnpm dev                 # Servidor de desarrollo
pnpm test                # Pruebas automatizadas
pnpm typecheck           # Verificación de tipos TypeScript
pnpm build               # Compilación
pnpm start                # Ejecución de producción, si está definido en package.json
pnpm prisma:generate     # Generación de Prisma Client
```

El proyecto también contempla `pnpm test:integration`. Esta prueba debe ejecutarse únicamente con `TEST_DATABASE_URL` apuntando a una base de datos exclusiva de pruebas. La existencia de la variable no significa que las pruebas de integración ya se hayan ejecutado.

Antes de utilizar cualquier comando, se recomienda confirmar su definición exacta en `package.json`.

### Verificaciones registradas

En la revisión técnica documentada se obtuvieron estos resultados:

| Verificación | Resultado |
|---|---|
| `pnpm typecheck` | Correcto. |
| `pnpm build` | Correcto. |
| `pnpm test` | Correcto: 23 archivos y 149 pruebas. |
| `pnpm test:integration` | No ejecutado en esa revisión. |
| Pruebas funcionales HTTP de aceptación | Pendientes. |

También se verificó la aplicación de dos migraciones en la base de datos de pruebas y la presencia de la columna opcional `appointments.reason`.

Estos resultados no sustituyen la ejecución de pruebas funcionales de aceptación sobre todos los endpoints y reglas de negocio.

## 10.0 Documentación del proyecto

El análisis y diseño se encuentra en `docs/`:

- `00.0_requirements.md`: requerimientos funcionales y alcance.
- `01.0_business-rules.md`: reglas de negocio.
- `02.0_entities-and-attributes.md`: entidades y atributos.
- `03.0_diagram-er.md`: modelo entidad-relación.
- `04.0_relation-model.dbml`: modelo relacional.
- `05.0_normalization.md`: análisis de normalización.
- `06.0_architecture.md`: arquitectura y decisiones técnicas.

Los documentos deben mantenerse alineados con el código y las migraciones de la versión vigente.

## 11.0 Adaptaciones respecto a los ejercicios de FUNVAL

Este proyecto toma como referencia los ejercicios prácticos desarrollados durante el programa FullStack FUNVAL. Sus ejemplos se adaptan a las tecnologías, arquitectura y necesidades de Clínica Salud Integral, en lugar de copiarse sin considerar el contexto.

El objetivo es aplicar los conceptos aprendidos en un sistema concreto, conservando la coherencia del código y evitando cambios arquitectónicos que no aporten valor.

### 11.1. Identificadores UUID

Los ejercicios de referencia pueden utilizar identificadores numéricos. En este proyecto, los modelos de Prisma definen los identificadores como UUID (`String` en TypeScript y `@db.Uuid` en PostgreSQL).

Los UUID no dependen de una secuencia numérica y son menos predecibles que los identificadores incrementales. Esto no sustituye la autenticación ni la autorización.

### 11.2. Nomenclatura de la fecha de la cita

En el modelo Prisma, el campo se denomina `scheduledAt`. En PostgreSQL se mapea a la columna física `startAt`. Es importante distinguir el nombre del campo del ORM del nombre de la columna persistida.

### 11.3. Nombre del campo de contraseña

El modelo `User` utiliza `passwordHash` para expresar que se almacena un hash, no la contraseña original. La autenticación utiliza bcryptjs para verificar las credenciales. Las contraseñas no deben almacenarse en texto plano.

### 11.4. Convenciones de nomenclatura de archivos

El proyecto conserva la convención de nombres establecida en el repositorio, por ejemplo, archivos de modelos, servicios y controladores con nombres como `patientsModel.ts`, `patients.service.ts` o `patients.controller.ts`, según la organización efectiva de cada módulo.

Mantener una nomenclatura uniforme dentro del repositorio facilita la lectura y el mantenimiento.

### 11.5. Exportación y uso de Prisma

La aplicación utiliza una instancia compartida de Prisma Client configurada para PostgreSQL mediante el adaptador correspondiente. Los servicios y módulos de acceso a datos deben reutilizar la instancia configurada, en lugar de crear conexiones independientes.

### 11.6. Registro y administración de cuentas

El modelo `User` y el módulo de autenticación permiten identificar cuentas y autenticar usuarios. No se debe inferir de ello que exista un endpoint administrativo para crear, listar o modificar cuentas. Tampoco se documenta un endpoint de registro público como funcionalidad disponible.

### 11.7. Relación entre usuarios y médicos

`User` y `Doctor` representan conceptos distintos: una cuenta de acceso y un registro profesional. El esquema Prisma incorpora una relación opcional mediante `doctorId`, con unicidad para que un médico no tenga más de una cuenta. Las operaciones del rol `MEDICO` comprueban que exista una asociación válida con el registro médico correspondiente.

### 11.8. Configuración de JWT

La autenticación utiliza JWT. La clave de firma debe configurarse mediante variables de entorno y mantenerse fuera del repositorio. La configuración efectiva debe consultarse en el esquema de entorno y en el archivo `.env.example`.

### 11.9. Documentación de seguridad en Swagger

Swagger UI está disponible en `/api/docs` para consultar la documentación de la API. La documentación debe reflejar las rutas y los mecanismos de autenticación realmente implementados, sin presentar como disponibles operaciones futuras.

### 11.10. Integración de middlewares

La arquitectura organiza rutas, middlewares, controladores, servicios y acceso a datos por responsabilidad. Las rutas protegidas revisadas utilizan autenticación y autorización; los permisos de cada endpoint deben verificarse en su implementación y no deducirse únicamente del nombre del módulo.

### Criterio general de adaptación

Los ejercicios de FUNVAL sirven como referencia de aprendizaje e implementación. Se conservan las decisiones de arquitectura, nomenclatura, seguridad y reglas de negocio que son coherentes con el proyecto. Las adaptaciones permiten integrar los conocimientos del curso manteniendo la consistencia, la mantenibilidad y la evolución del sistema.
"""

out = Path("/mnt/data/README_revisado.md")
out.write_text(readme, encoding="utf-8")
print(f"Creado: {out}")
print(f"Líneas: {len(readme.splitlines())}")
