from pathlib import Path

doc = r"""# FUNVAL — Clínica Salud Integral: metodología y documentación extendida

## 1. Descripción

Este documento reúne la descripción técnica y la metodología de trabajo utilizada para analizar, diseñar, implementar, documentar y revisar el proyecto **Clínica Salud Integral — API REST**.

El proyecto parte de los ejercicios y conocimientos desarrollados durante la formación Full Stack FUNVAL y los aplica a una API con persistencia relacional. La solución implementada utiliza Node.js, TypeScript, Express 5, Prisma ORM 7 y PostgreSQL.

La metodología organiza el trabajo en tres grandes áreas:

- **Análisis y diseño:** comprensión del problema, identificación de requerimientos, reglas de negocio, modelado de datos y arquitectura.
- **Implementación:** construcción de la API REST, configuración de la persistencia, validaciones, autenticación, autorización y consultas.
- **Validación y documentación:** ejecución de pruebas, revisión de restricciones, verificación técnica y mantenimiento de los documentos del proyecto.

El propósito es mantener trazabilidad entre lo que necesita resolver el sistema, lo que se diseñó y lo que realmente está implementado. La documentación distingue entre funcionalidades confirmadas, decisiones de diseño y verificaciones que todavía requieren pruebas funcionales.

La versión actual es un backend API. No debe interpretarse como una aplicación clínica integral con interfaz gráfica, expediente clínico ampliado, pagos o facturación.

## 2. Tecnologías y herramientas

### Backend

- **Node.js:** entorno de ejecución de JavaScript.
- **pnpm:** gestor de paquetes utilizado por el proyecto.
- **TypeScript:** lenguaje de programación con tipado estático.
- **Express 5:** framework para construir la API REST.
- **Prisma ORM 7:** herramienta para definir el esquema, generar el cliente y administrar migraciones.
- **Zod:** biblioteca utilizada para validar datos de entrada y configuración.
- **JWT:** mecanismo de autenticación mediante tokens.
- **bcryptjs:** biblioteca utilizada para verificar contraseñas mediante hashes.
- **Vitest:** herramienta para ejecutar pruebas automatizadas.
- **Supertest:** herramienta contemplada para pruebas HTTP.
- **Swagger UI / OpenAPI:** documentación interactiva de la API.

Las versiones exactas de Node.js y pnpm deben consultarse en `package.json` y en la configuración del entorno del repositorio; este documento evita fijar versiones que podrían quedar desactualizadas.

### Base de datos

- **PostgreSQL:** sistema gestor de bases de datos relacionales.
- **Prisma Schema:** definición de modelos, atributos, enumeraciones y relaciones.
- **Prisma Migrate:** herramienta para administrar cambios estructurales mediante migraciones.
- **Prisma Client:** cliente generado para realizar consultas y operaciones desde TypeScript.

### Diseño y documentación

- **DBML:** lenguaje utilizado para representar el modelo relacional.
- **Mermaid / herramientas ERD:** representación gráfica de modelos y relaciones.
- **Markdown:** documentación técnica y metodológica.
- **OpenAPI:** especificación de la interfaz HTTP documentada mediante Swagger UI.

### Herramientas de desarrollo

- **Visual Studio Code:** entorno de desarrollo.
- **Git:** sistema de control de versiones.
- **GitHub:** alojamiento y colaboración del repositorio.
- **Docker:** herramienta opcional para administrar entornos de desarrollo y bases de datos; no debe considerarse requisito de ejecución si el proyecto no lo utiliza en el flujo correspondiente.

## 3. Estructura del proyecto

La organización general del proyecto se distribuye en documentación, esquema y migraciones de Prisma, código fuente, pruebas y archivos de configuración.

```text
.
├── docs/
│   ├── 00.0_requirements.md
│   ├── 01.0_business-rules.md
│   ├── 02.0_entities-and-attributes.md
│   ├── 03.0_diagram-er.md
│   ├── 04.0_relation-model.dbml
│   ├── 05.0_normalization.md
│   └── 06.0_architecture.md
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── generated/
│   └── prisma/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── support/
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── prisma.config.ts
├── tsconfig.json
└── tsconfig.build.json
```

El árbol representa las áreas principales del repositorio. Los archivos concretos pueden variar según el contenido actual de cada módulo; no debe inferirse la existencia de un CRUD completo solo porque exista una carpeta, un modelo o un router.

### Instalación, variables de entorno y comandos

Instalar dependencias y preparar el archivo de entorno:

```sh
pnpm install
cp .env.example .env
```

Configurar las variables necesarias en `.env`. No publicar ese archivo ni sus credenciales.

- `DATABASE_URL`: URL de conexión de la aplicación a PostgreSQL.
- `TEST_DATABASE_URL`: URL destinada a pruebas que requieran una base de datos exclusiva de pruebas.
- `JWT_SECRET`: clave utilizada para firmar y verificar tokens JWT.
- `PORT`: puerto HTTP, cuando esté configurado.
- `NODE_ENV`: entorno de ejecución.

Los nombres y requisitos definitivos deben comprobarse en `src/config/` y `.env.example`. `TEST_DATABASE_URL` no sustituye automáticamente a `DATABASE_URL` para los comandos de Prisma CLI.

Comandos principales utilizados o contemplados por el proyecto:

```sh
pnpm prisma:generate
pnpm dev
pnpm test
pnpm test:integration
pnpm typecheck
pnpm build
pnpm start
```

Antes de ejecutar un comando, confirmar su definición exacta en `package.json`.

- `pnpm test` ejecuta la suite automatizada configurada para pruebas unitarias y HTTP.
- `pnpm test:integration` está destinado a pruebas que requieren PostgreSQL y debe utilizar exclusivamente `TEST_DATABASE_URL`.
- `pnpm typecheck` verifica los tipos de TypeScript.
- `pnpm build` compila la aplicación para producción.
- `pnpm dev` inicia el servidor en desarrollo.
- `pnpm start` ejecuta el proceso de producción si el script está definido.

La API expone `GET /health` y Swagger UI en `/api/docs`.

## 4. Metodología de desarrollo

El desarrollo del proyecto se organizó en fases de análisis, diseño, implementación y validación. Las fases describen el proceso seguido y pueden reutilizarse como guía en proyectos derivados.

### Fase 1. Análisis de requerimientos

**Archivo:** `docs/00.0_requirements.md`

**Objetivo:** comprender el problema del cliente, identificar el alcance y convertir las necesidades iniciales en requerimientos claros.

Actividades:

1. Consulta inicial y comprensión del problema.
   - Documentar la idea original.
   - Identificar la necesidad que se busca resolver.
   - Reconocer los procesos actuales.
   - Identificar actores y responsabilidades.
   - Registrar las funcionalidades solicitadas.

2. Análisis y detección de vacíos.
   - Identificar información faltante o ambigua.
   - Detectar contradicciones.
   - Examinar flujos de trabajo y excepciones.
   - Identificar permisos y responsabilidades no especificados.
   - Formular preguntas para aclarar el alcance.

3. Validación de decisiones.
   - Aclarar procesos y excepciones.
   - Definir responsabilidades.
   - Registrar decisiones y acuerdos.
   - Diferenciar requisitos confirmados, supuestos y pendientes.

4. Consolidación.
   - Definir propósito y alcance.
   - Identificar actores.
   - Describir procesos y funcionalidades.
   - Documentar restricciones.
   - Establecer criterios de aceptación.

**Resultado:** documento de requerimientos que establece qué debe resolver el sistema y qué queda fuera de alcance.

### Fase 2. Reglas de negocio

**Archivo:** `docs/01.0_business-rules.md`

**Objetivo:** establecer las condiciones que regulan el comportamiento de la aplicación.

Actividades:

- Identificar restricciones del negocio.
- Definir condiciones para registrar y modificar información.
- Establecer relaciones permitidas.
- Identificar restricciones de unicidad y obligatoriedad.
- Determinar las reglas que deben validarse en la aplicación o en la base de datos.
- Distinguir reglas implementadas de propuestas que aún no están verificadas.

**Resultado:** conjunto de reglas trazables a los requerimientos y al código.

### Fase 3. Entidades y atributos

**Archivo:** `docs/02.0_entities-and-attributes.md`

**Objetivo:** identificar los elementos del sistema que necesitan representarse mediante datos.

Actividades:

- Identificar entidades principales.
- Diferenciar entidades independientes y dependientes.
- Identificar atributos y su significado.
- Definir claves primarias y candidatas.
- Determinar atributos obligatorios, opcionales y únicos.
- Identificar relaciones entre entidades.

**Resultado:** catálogo de entidades y atributos que sirve como base para el modelo entidad-relación.

### Fase 4. Modelo entidad-relación

**Archivo:** `docs/03.0_diagram-er.md`

**Objetivo:** representar conceptualmente la estructura de los datos y sus relaciones.

Actividades:

- Establecer relaciones entre entidades.
- Definir cardinalidades: uno a uno, uno a muchos y muchos a muchos.
- Identificar entidades asociativas cuando sean necesarias.
- Determinar participación obligatoria u opcional.
- Documentar las relaciones y sus justificaciones.
- Construir y revisar el diagrama.

**Resultado:** modelo conceptual coherente con los requerimientos y las reglas de negocio.

### Fase 5. Modelo relacional

**Archivo:** `docs/04.0_relation-model.dbml`

**Objetivo:** transformar el modelo conceptual en una estructura relacional.

Actividades:

- Convertir entidades en tablas.
- Definir columnas y tipos de datos.
- Establecer claves primarias y foráneas.
- Resolver relaciones muchos a muchos.
- Definir restricciones de integridad.
- Representar el modelo mediante DBML.
- Comparar el modelo documental con el esquema implementado.

**Resultado:** modelo relacional que describe tablas, columnas, claves y relaciones.

### Fase 6. Normalización

**Archivo:** `docs/05.0_normalization.md`

**Objetivo:** evaluar la estructura de las tablas para reducir redundancias y prevenir anomalías.

Actividades:

- Identificar dependencias funcionales.
- Revisar Primera Forma Normal (1FN).
- Revisar Segunda Forma Normal (2FN).
- Revisar Tercera Forma Normal (3FN).
- Evaluar redundancias y anomalías de inserción, actualización y eliminación.
- Documentar las decisiones de normalización y sus límites.

**Resultado:** análisis justificado de la estructura relacional.

### Fase 7. Arquitectura del sistema

**Archivo:** `docs/06.0_architecture.md`

**Objetivo:** documentar la organización de la solución y las decisiones arquitectónicas.

Actividades:

- Describir los componentes principales.
- Explicar la relación entre backend y base de datos.
- Definir responsabilidades de rutas, middlewares, controladores, servicios y acceso a datos.
- Documentar el flujo de solicitudes HTTP.
- Explicar la conexión entre Express, Prisma y PostgreSQL.
- Identificar decisiones relevantes para mantenimiento y evolución.

**Resultado:** descripción técnica de la arquitectura identificada en el proyecto.

### Fase 8. Diseño y documentación de la API

**Referencia:** rutas implementadas y documentación OpenAPI.

**Objetivo:** describir cómo el backend expone sus funcionalidades mediante endpoints REST.

Actividades:

- Identificar recursos y rutas.
- Documentar métodos HTTP y parámetros.
- Describir datos de entrada y respuestas.
- Registrar códigos HTTP.
- Identificar rutas protegidas.
- Documentar permisos por rol a partir de los middlewares reales.
- Relacionar endpoints con requerimientos y reglas de negocio.

**Resultado:** contrato de API alineado con las rutas realmente implementadas. No se deben documentar como disponibles endpoints que solo existan en propuestas anteriores.

### Fase 9. Estrategia de validación

**Referencia:** pruebas automatizadas, verificaciones técnicas y criterios de aceptación.

**Objetivo:** establecer cómo se comprueba el comportamiento del sistema.

Actividades:

- Identificar escenarios de prueba.
- Validar datos de entrada con Zod.
- Comprobar restricciones de PostgreSQL.
- Probar endpoints y códigos HTTP.
- Comprobar relaciones y restricciones.
- Validar autenticación, autorización y pertenencia de recursos.
- Registrar pruebas ejecutadas y pendientes.

**Resultado:** evidencia de validación que permita distinguir compilación, pruebas automatizadas, pruebas de integración y aceptación funcional.

## 5. Implementación del sistema

Una vez completados el análisis y el diseño, se desarrolla la solución técnica. Las siguientes fases describen los componentes del proyecto y el trabajo realizado; no implican que todas las capacidades posibles de cada componente estén implementadas.

### Fase 10. Configuración del entorno

**Archivos principales:**

- `package.json`
- `tsconfig.json`
- `.env`
- `.env.example`
- `prisma.config.ts`

**Objetivo:** preparar el entorno de desarrollo y configurar los componentes necesarios.

Actividades:

- Configurar Node.js y pnpm.
- Configurar TypeScript.
- Instalar y configurar Express.
- Configurar Prisma ORM.
- Configurar PostgreSQL.
- Validar variables de entorno.
- Preparar la conexión mediante el adaptador de PostgreSQL.
- Verificar el funcionamiento del entorno.

**Resultado:** entorno preparado para desarrollar y ejecutar la API.

### Fase 11. Implementación del modelo Prisma

**Archivo:** `prisma/schema.prisma`

**Objetivo:** representar el modelo relacional mediante modelos, campos y relaciones de Prisma.

El esquema implementado contiene cinco modelos principales:

- `Patient`
- `Doctor`
- `Specialty`
- `Appointment`
- `User`

También define los enums `AppointmentStatus` y `UserRole`, además de relaciones, restricciones e índices.

Actividades:

- Definir modelos y atributos.
- Establecer identificadores UUID.
- Definir tipos de datos.
- Establecer campos obligatorios y opcionales.
- Definir relaciones.
- Configurar claves únicas e índices.
- Definir enumeraciones.
- Comparar el esquema con el modelo relacional documentado.

**Resultado:** esquema Prisma que representa el modelo de datos implementado.

### Fase 12. Migraciones de base de datos

**Directorio:** `prisma/migrations/`

**Objetivo:** registrar y aplicar los cambios estructurales de la base de datos.

Actividades:

- Generar migraciones.
- Revisar los cambios generados.
- Aplicar migraciones al entorno correspondiente.
- Verificar la estructura en PostgreSQL.
- Registrar modificaciones estructurales.
- Mantener sincronizados el esquema Prisma y la base de datos.

**Resultado:** estructura de base de datos reproducible mediante migraciones versionadas.

En la revisión técnica registrada se confirmó la aplicación de dos migraciones en la base de datos de pruebas.

### Fase 13. Datos iniciales

**Archivo:** `prisma/seed.ts`

**Objetivo:** preparar datos iniciales de catálogo para el entorno de desarrollo o prueba.

El seed implementado utiliza operaciones idempotentes para crear o actualizar tres especialidades —Medicina General, Pediatría y Cardiología— y dos médicos por especialidad.

Actividades:

- Preparar registros iniciales.
- Respetar dependencias entre modelos.
- Insertar registros relacionados.
- Evitar duplicaciones al volver a ejecutar el proceso.
- Verificar que los datos correspondan al esquema.

**Resultado:** catálogo inicial de especialidades y médicos.

El seed descrito no debe confundirse con un proceso de aprovisionamiento de cuentas de usuario ni con un endpoint de registro.

### Fase 14. Implementación de la API REST

**Directorio:** `src/`

**Objetivo:** desarrollar los endpoints que permiten interactuar con los recursos del sistema.

Responsabilidades principales:

- `routes/`: definir rutas y métodos HTTP.
- `controllers/`: recibir solicitudes y gestionar respuestas.
- `services/`: implementar lógica de aplicación y coordinar operaciones.
- `schemas/`: validar datos de entrada mediante Zod.
- `middlewares/`: gestionar autenticación, autorización y validaciones transversales.
- `models/`: organizar operaciones de acceso a datos.
- `config/`: centralizar configuraciones.
- `utils/`: mantener funciones auxiliares reutilizables.
- `app.ts`: configurar Express y montar rutas.
- `server.ts`: iniciar el servidor HTTP.

**Resultado:** API REST modular que implementa las operaciones confirmadas del proyecto.

### Fase 15. Consultas y operaciones con Prisma Client

**Objetivo:** recuperar, registrar y actualizar información mediante Prisma Client.

Las operaciones utilizadas dependen de cada servicio. Prisma Client ofrece, entre otras, las siguientes:

- Crear registros con `create`.
- Consultar registros con `findMany`, `findUnique` y `findFirst`.
- Actualizar información con `update` y `updateMany`.
- Consultar relaciones mediante `include` y `select`.
- Aplicar filtros y ordenamientos.
- Utilizar operaciones de agregación y agrupación.
- Ejecutar transacciones cuando el caso lo requiera.
- Utilizar SQL parametrizado mediante `$queryRaw` cuando esté justificado.

**Resultado:** operaciones de persistencia alineadas con el modelo y las reglas de negocio implementadas.

## 6. Orden general de implementación

El flujo general aplicado al proyecto puede resumirse así:

| Orden | Actividad | Herramienta o componente |
|---|---|---|
| 1 | Configurar el entorno | Node.js, pnpm y TypeScript |
| 2 | Configurar PostgreSQL y Prisma | Prisma ORM |
| 3 | Definir los modelos | `schema.prisma` |
| 4 | Crear y aplicar la estructura de base de datos | Prisma Migrate |
| 5 | Insertar datos iniciales | `seed.ts` |
| 6 | Implementar rutas y controladores | Express |
| 7 | Implementar lógica de aplicación | Services y acceso a datos |
| 8 | Validar datos de entrada | Zod |
| 9 | Implementar autenticación y autorización | JWT, bcryptjs y middlewares |
| 10 | Ejecutar pruebas automatizadas | Vitest y herramientas de prueba configuradas |
| 11 | Documentar la API | Swagger UI / OpenAPI |

El orden puede ajustarse según las dependencias entre módulos. Las capacidades no confirmadas deben tratarse como trabajo futuro, no como parte de la entrega actual.

## 7. Validación del proyecto

Antes de considerar terminado un proyecto derivado, se recomienda verificar los siguientes puntos. El checklist es una guía de aceptación; no significa que todos los puntos estén aprobados en la versión actual.

### Análisis y diseño

- [ ] Los requerimientos están documentados.
- [ ] Las reglas de negocio están definidas.
- [ ] Las entidades y atributos están identificados.
- [ ] El modelo entidad-relación representa el sistema.
- [ ] El modelo relacional coincide con el diseño conceptual.
- [ ] La normalización está documentada.
- [ ] La arquitectura está explicada.
- [ ] Los endpoints están especificados.
- [ ] La estrategia de validación está definida.

### Implementación

- [ ] El entorno de desarrollo está configurado.
- [ ] PostgreSQL está disponible.
- [ ] Prisma está conectado correctamente.
- [ ] Los modelos Prisma representan el diseño aprobado.
- [ ] Las migraciones se ejecutan correctamente.
- [ ] Los datos iniciales respetan las relaciones.
- [ ] Los endpoints responden correctamente.
- [ ] Las validaciones de entrada funcionan.
- [ ] Las reglas de negocio se respetan.
- [ ] La autenticación y autorización se validan.
- [ ] Las consultas y operaciones de Prisma producen los resultados esperados.
- [ ] Las pruebas unitarias están ejecutadas.
- [ ] Las pruebas de integración están ejecutadas cuando corresponda.
- [ ] Las pruebas HTTP y de aceptación están ejecutadas.
- [ ] La documentación está actualizada.

### Verificaciones registradas en esta versión

En la revisión técnica documentada se obtuvieron los siguientes resultados:

| Verificación | Resultado |
|---|---|
| `pnpm typecheck` | Correcto. |
| `pnpm build` | Correcto. |
| `pnpm test` | Correcto: 23 archivos de prueba y 149 pruebas. |
| `pnpm test:integration` | No ejecutado en esa revisión. |
| Pruebas funcionales HTTP de aceptación | Pendientes. |

También se verificó la aplicación de dos migraciones en la base de datos de pruebas y la presencia de la columna opcional `appointments.reason`.

Estos resultados no equivalen a una certificación funcional integral. Las pruebas de integración y la aceptación funcional deben ejecutarse para confirmar los flujos completos de la API.

## 8. Control de versiones

Utilizar Git para registrar la evolución del proyecto.

Flujo básico:

```bash
git status
git add .
git commit -m "type: describe the changes"
git push
```

Ejemplos de mensajes:

- `docs: update business requirements`
- `docs: document database relationships`
- `feat: configure prisma schema`
- `feat: create database migration`
- `feat: implement appointment endpoints`
- `feat: add request validation with zod`
- `test: validate appointment permissions`
- `docs: update API documentation`

No incluir credenciales, archivos `.env` ni información sensible en el repositorio.

## 9. Principios de trabajo

- Comprender el problema antes de diseñar los datos.
- Justificar las decisiones de diseño.
- Mantener coherencia entre requerimientos, reglas de negocio y modelos.
- Documentar cada etapa del proceso.
- Separar el diseño relacional de su implementación mediante Prisma.
- Evitar agregar entidades, atributos o reglas innecesarias.
- Utilizar migraciones para administrar los cambios estructurales.
- Aplicar validaciones en la aplicación y restricciones en la base de datos cuando corresponda.
- Mantener separadas las responsabilidades del backend.
- Validar las funcionalidades mediante pruebas.
- Diferenciar entre código implementado, pruebas ejecutadas y funcionalidades pendientes.
- Mantener los archivos organizados y reproducibles.
- Utilizar control de versiones desde el inicio.
- No documentar como disponible una funcionalidad que solo esté propuesta.

## 10. Autoría

**Gustavo Andrés Santoyo Benavides**

FUNVAL — Full Stack Development

Proyecto académico: **Clínica Salud Integral — API REST**.

Database Design and Full Stack API Implementation Practice.

*Este repositorio documenta el desarrollo académico y técnico de Clínica Salud Integral. Su alcance debe interpretarse conforme a las funcionalidades y verificaciones descritas en esta documentación y en el código fuente.*


out = Path("/mnt/data/README.ES_revisado.md")
out.write_text(doc, encoding="utf-8")
print(f"Documento creado: {out.name}")
print(f"Líneas: {len(doc.splitlines())}")
