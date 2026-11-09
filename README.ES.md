# FUNVAL — Plantilla de Proyecto Full Stack con Prisma

## 1. Descripción

Esta plantilla proporciona una estructura estandarizada y una metodología de trabajo para analizar, diseñar, implementar, documentar y validar sistemas que utilizan bases de datos relacionales y APIs REST.

Está diseñada para utilizarse como punto de partida en los ejercicios y proyectos académicos de desarrollo Full Stack durante la formación en FUNVAL.

La metodología organiza el desarrollo en tres grandes áreas:

- **Análisis y diseño:** comprensión del problema, identificación de requerimientos, reglas de negocio, modelado de datos y arquitectura.
- **Implementación:** construcción de una API REST utilizando Node.js, pnpm, TypeScript, Express 5 y Prisma ORM 7, conectada a PostgreSQL.
- **Validación y documentación:** comprobación de las reglas de negocio, integridad de los datos, funcionamiento de los endpoints y comportamiento del sistema.

El propósito es trabajar de manera progresiva, documentada y reproducible, evitando comenzar directamente con la programación sin comprender primero el problema que se desea resolver.

La plantilla busca mantener una separación clara entre las necesidades del negocio, el diseño de los datos y las decisiones técnicas de implementación.

## 2. Tecnologías y herramientas

### Backend

- **Node.js:** entorno de ejecución de JavaScript; requiere `>=20.19.0`.
- **pnpm:** gestor de paquetes; el proyecto fija la versión `12.18.0`.
- **TypeScript:** lenguaje de programación con tipado estático.
- **Express 5:** framework para construir APIs REST.
- **Prisma ORM 7:** herramienta para modelar datos, generar el cliente y administrar migraciones en proyectos derivados.
- **Zod:** biblioteca utilizada para validar variables de entorno y disponible para validar datos de entrada.
- **Vitest y Supertest:** herramientas para pruebas unitarias y HTTP.
- **Swagger UI:** interfaz para consultar la especificación OpenAPI básica.

La plantilla no incluye autenticación implementada ni instala JWT o bcrypt.
La autenticación con JWT y el hashing de contraseñas son funcionalidades
futuras y opcionales para un proyecto derivado.

### Base de datos

- **PostgreSQL:** sistema gestor de bases de datos relacionales.
- **Prisma Schema:** lenguaje de modelado utilizado para definir modelos, atributos y relaciones.
- **Prisma Migrate:** herramienta disponible para administrar cambios estructurales cuando un proyecto derivado agregue modelos y migraciones.
- **Prisma Client:** cliente generado para realizar consultas y operaciones desde TypeScript.

### Diseño y documentación

- **DBML:** lenguaje para representar modelos relacionales.
- **Mermaid / herramientas ERD:** representación gráfica de modelos y relaciones.
- **Markdown:** documentación técnica y metodológica.

### Herramientas de desarrollo

- **Visual Studio Code:** entorno de desarrollo.
- **Git:** sistema de control de versiones.
- **GitHub:** alojamiento y colaboración de proyectos.
- **Docker:** herramienta opcional para administrar entornos de desarrollo y bases de datos.

## 3. Estructura del proyecto

Estructura actual de la plantilla:

```text
.
├── docs/                 Documentación académica y técnica
├── generated/            Clientes Prisma generados localmente (ignorado por Git)
├── prisma/
│   ├── migrations/       Sin migraciones de dominio al inicio
│   └── schema.prisma     Proveedor PostgreSQL y generador, sin modelos
├── src/
│   ├── config/           Entorno y cliente Prisma de la aplicación
│   ├── app.ts            Aplicación Express, health check y Swagger UI
│   └── server.ts         Inicio del servidor HTTP
├── tests/
│   ├── integration/      Conexión PostgreSQL de solo lectura (SELECT 1)
│   ├── support/          Cliente y validación de URL de prueba
│   └── *.test.ts         Pruebas unitarias, HTTP y de aislamiento
├── .env.example
├── package.json
├── pnpm-lock.yaml
├── prisma7.config.ts
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
└── vitest.integration.config.ts
```

El esquema y las migraciones de producción comienzan sin modelos de negocio ni
migraciones de dominio. La estructura puede ampliarse en un proyecto derivado
sin agregar carpetas, dependencias o capas que no aporten valor.

### Instalación, variables de entorno y comandos

Requisitos: Node.js `>=20.19.0` y pnpm `12.18.0`. PostgreSQL se necesita para
conectar la aplicación o ejecutar la prueba de integración.

```sh
pnpm install
cp .env.example .env
```

Configura las URLs en `.env`; no publiques ese archivo ni sus credenciales:

- `DATABASE_URL`: URL obligatoria para la configuración Prisma normal de la
  aplicación.
- `TEST_DATABASE_URL`: URL opcional para la prueba de integración. Debe apuntar
  a una base PostgreSQL **exclusiva para pruebas** cuyo nombre termine en
  `_test`. Nunca sustituye a `DATABASE_URL`.
- `PORT`: puerto HTTP, por defecto `3000`.
- `NODE_ENV`: `development`, `test` o `production`, por defecto `development`.

Comandos definidos en `package.json`:

```sh
pnpm prisma:generate
pnpm dev
pnpm test
pnpm test:integration
pnpm typecheck
pnpm build
pnpm start
```

`pnpm test` ejecuta las pruebas unitarias y HTTP sin requerir PostgreSQL.
`pnpm test:integration` utiliza solo `TEST_DATABASE_URL`, ejecuta
`SELECT 1 AS result` y desconecta; no aplica migraciones ni realiza escrituras.
`pnpm typecheck` verifica tipos y `pnpm build` compila únicamente la salida de
producción. La API ofrece `GET /health` y Swagger UI en `/api/docs`.

## 4. Metodología de desarrollo

El desarrollo se divide en seis fases generales:

1. Análisis: comprender el problema y determinar qué necesita resolver el sistema.
2. Diseño: transformar los requerimientos en reglas de negocio y modelos de datos.
3. Arquitectura: definir la organización de la base de datos y la API.
4. Implementación: construir el backend y la persistencia utilizando Prisma y PostgreSQL.
5. Validación: comprobar las reglas, restricciones, consultas y endpoints.
6. Documentación: mantener actualizados los documentos y registrar la evolución del proyecto.

### Fase 1. Análisis de requerimientos

**Archivo:** `docs/00.0_requirements.md`

**Objetivo:** comprender la idea del cliente, analizar su viabilidad desde la lógica del negocio y construir una especificación clara de lo que el sistema debe resolver.

Actividades:

1. Consulta inicial con el cliente.
   - Obtener y documentar la idea original.
   - Comprender el problema o necesidad.
   - Identificar los objetivos esperados.
   - Conocer los procesos actuales.
   - Identificar actores y responsabilidades.
   - Registrar las funcionalidades solicitadas.

2. Análisis de la idea y detección de vacíos.
   - Examinar los procesos desde la lógica del negocio.
   - Identificar información faltante o ambigua.
   - Detectar contradicciones.
   - Identificar responsabilidades y permisos no especificados.
   - Examinar flujos de trabajo y excepciones.
   - Formular preguntas y proponer alternativas.

3. Consulta complementaria y validación.
   - Presentar dudas y contradicciones.
   - Aclarar procesos y excepciones.
   - Definir responsabilidades y permisos.
   - Confirmar el alcance.
   - Registrar respuestas, decisiones y acuerdos.
   - Diferenciar requerimientos confirmados, suposiciones y cuestiones pendientes.

4. Consolidación de requerimientos.
   - Definir propósito y alcance.
   - Identificar actores.
   - Describir procesos y funcionalidades.
   - Establecer requerimientos funcionales y no funcionales.
   - Documentar restricciones.
   - Definir criterios de aceptación.

**Resultado esperado:** un documento de requerimientos que represente una visión clara y validada del sistema.

### Fase 2. Reglas de negocio

**Archivo:** `docs/01.0_business-rules.md`

**Objetivo:** establecer las condiciones que regulan el funcionamiento del sistema.

Actividades:

- Identificar restricciones del negocio.
- Definir condiciones para registrar y modificar información.
- Establecer relaciones permitidas.
- Determinar reglas de participación.
- Identificar restricciones de unicidad y obligatoriedad.
- Definir condiciones para mantener la consistencia de los datos.
- Identificar reglas que deberán validarse en la aplicación.

**Resultado esperado:** un conjunto de reglas claras que puedan traducirse en modelos, restricciones de base de datos y validaciones del backend.

### Fase 3. Entidades y atributos

**Archivo:** `docs/02.0_entities-and-attributes.md`

**Objetivo:** identificar los elementos del sistema que necesitan representarse mediante datos.

Actividades:

- Identificar entidades principales.
- Diferenciar entidades independientes y dependientes.
- Identificar atributos.
- Definir el significado de cada atributo.
- Proponer claves primarias.
- Identificar claves candidatas.
- Determinar atributos obligatorios, opcionales y únicos.
- Identificar posibles relaciones entre entidades.

**Resultado esperado:** un catálogo de entidades y atributos que sirva como base para construir el modelo entidad-relación.

### Fase 4. Modelo entidad-relación

**Archivos:**

- `docs/03.0_diagram-er.md`

**Objetivo:** representar gráficamente la estructura conceptual de los datos y sus relaciones.

Actividades:

- Establecer relaciones entre entidades.
- Definir cardinalidades: uno a uno, uno a muchos y muchos a muchos.
- Identificar entidades asociativas cuando sean necesarias.
- Determinar participación obligatoria u opcional.
- Documentar las relaciones y sus justificaciones.
- Construir el diagrama entidad-relación.
- Revisar que el diagrama represente las reglas de negocio.

**Resultado esperado:** un modelo conceptual coherente con los requerimientos y las reglas de negocio.

### Fase 5. Modelo relacional

**Archivo:** `docs/04.0_relation-model.dbml`

**Objetivo:** transformar el modelo conceptual en una estructura relacional.

Actividades:

- Convertir entidades en tablas.
- Definir columnas.
- Proponer tipos de datos.
- Establecer claves primarias y foráneas.
- Resolver relaciones muchos a muchos.
- Definir restricciones de integridad.
- Representar el modelo mediante DBML.
- Generar una visualización del esquema.

**Resultado esperado:** un modelo relacional que describa las tablas, columnas, claves y relaciones de la base de datos.

### Fase 6. Normalización

**Archivo:** `docs/05.0_normalization.md`

**Objetivo:** evaluar la estructura de las tablas para reducir redundancias y prevenir anomalías.

Actividades:

- Identificar dependencias funcionales.
- Revisar Primera Forma Normal (1FN).
- Revisar Segunda Forma Normal (2FN).
- Revisar Tercera Forma Normal (3FN).
- Identificar redundancias.
- Evaluar anomalías de inserción, actualización y eliminación.
- Documentar las decisiones de normalización.

**Resultado esperado:** una estructura relacional consistente y justificada desde el punto de vista de la normalización.

### Fase 7. Arquitectura del sistema

**Archivo:** `docs/06.0_architecture.md`

**Objetivo:** documentar la organización general de la solución y las decisiones arquitectónicas.

Actividades:

- Describir los componentes principales.
- Explicar la relación entre backend y base de datos.
- Definir las responsabilidades de cada capa.
- Documentar el flujo de las solicitudes HTTP.
- Explicar la conexión entre Express, Prisma y PostgreSQL.
- Identificar decisiones relevantes para mantenimiento y evolución.

**Resultado esperado:** una descripción técnica de la arquitectura del sistema.

### Fase 8. Diseño de la API

**Documento sugerido para el proyecto derivado:** diseño de la API. No forma
parte actualmente de la plantilla.

**Objetivo:** definir cómo el backend expondrá las funcionalidades del sistema mediante endpoints REST.

Actividades:

- Identificar los recursos de la API.
- Definir endpoints y métodos HTTP.
- Establecer parámetros y datos de entrada.
- Definir estructuras de respuesta.
- Documentar códigos de estado HTTP.
- Identificar endpoints protegidos.
- Establecer permisos y responsabilidades por rol.
- Relacionar cada endpoint con los requerimientos y reglas de negocio.

**Resultado esperado:** una especificación de endpoints que permita implementar y validar la API de forma ordenada.

### Fase 9. Estrategia de validación

**Documento sugerido para el proyecto derivado:** estrategia de validación. No
forma parte actualmente de la plantilla.

**Objetivo:** establecer cómo se comprobará el funcionamiento del sistema.

Actividades:

- Identificar escenarios de prueba.
- Definir validaciones de entrada con Zod.
- Identificar restricciones que debe garantizar PostgreSQL.
- Definir pruebas de endpoints.
- Comprobar relaciones y restricciones.
- Validar autenticación y permisos cuando correspondan.
- Establecer criterios de aceptación.

**Resultado esperado:** un conjunto de escenarios y criterios que permitan comprobar que la implementación cumple los requerimientos.

## 5. Implementación del sistema

Una vez finalizado el análisis y el diseño, comienza la implementación técnica.

### Fase 10. Configuración del entorno

**Archivos principales:**

- `package.json`
- `tsconfig.json`
- `.env`
- `.env.example`
- `prisma7.config.ts`

**Objetivo:** preparar el entorno de desarrollo y configurar los componentes necesarios.

Actividades:

- Inicializar el proyecto Node.js.
- Configurar TypeScript.
- Instalar y configurar Express.
- Instalar Prisma ORM.
- Configurar PostgreSQL.
- Configurar las variables de entorno.
- Preparar la conexión mediante el adaptador correspondiente a PostgreSQL.
- Verificar que el entorno funcione correctamente.

**Resultado esperado:** un entorno de desarrollo configurado y preparado para implementar la API y su persistencia.

### Fase 11. Implementación del modelo Prisma

**Archivo:** `prisma/schema.prisma`

**Objetivo:** representar el modelo relacional mediante los modelos, campos y relaciones de Prisma.

Actividades:

- Definir los modelos.
- Establecer identificadores.
- Definir tipos de datos.
- Establecer campos obligatorios y opcionales.
- Definir relaciones.
- Configurar claves únicas.
- Definir índices cuando estén justificados.
- Configurar enumeraciones cuando sean necesarias.
- Comparar el esquema Prisma con el modelo relacional documentado.

**Resultado esperado:** un esquema Prisma coherente con el diseño de datos aprobado.

### Fase 12. Migraciones de base de datos

**Directorio:** `prisma/migrations/`

**Objetivo:** implementar y registrar los cambios estructurales de la base de datos.

Actividades:

- Generar la migración inicial.
- Revisar los cambios generados.
- Aplicar las migraciones.
- Verificar la estructura en PostgreSQL.
- Registrar cada modificación estructural.
- Mantener sincronizado el esquema Prisma con la base de datos.

**Resultado esperado:** una base de datos creada y evolucionada mediante migraciones reproducibles.

### Fase 13. Datos iniciales

**Archivo:** `prisma/seed.ts`

**Objetivo:** poblar la base de datos con información de prueba.

Actividades:

- Preparar registros representativos.
- Respetar las dependencias entre modelos.
- Insertar registros relacionados correctamente.
- Comprobar restricciones de integridad.
- Verificar que los datos sean coherentes con las reglas de negocio.
- Evitar duplicaciones cuando se vuelva a ejecutar el proceso.

**Resultado esperado:** una base de datos poblada con información de prueba útil para desarrollar y validar el sistema.

### Fase 14. Implementación de la API REST

**Directorio:** `src/`

**Objetivo:** desarrollar los endpoints que permiten interactuar con los recursos del sistema.

Responsabilidades principales:

- `routes/`: definir las rutas y métodos HTTP.
- `controllers/`: recibir solicitudes y gestionar las respuestas.
- `services/`: implementar la lógica de aplicación y coordinar operaciones.
- `schemas/`: validar datos de entrada mediante Zod.
- `middlewares/`: gestionar autenticación, autorización y validaciones transversales.
- `config/`: centralizar configuraciones.
- `utils/`: mantener funciones auxiliares reutilizables.
- `app.ts`: configurar Express.
- `server.ts`: iniciar el servidor.

La organización deberá responder a las necesidades reales del proyecto y no introducir capas innecesarias.

**Resultado esperado:** una API REST funcional que implemente los requerimientos y reglas de negocio utilizando Prisma Client para acceder a PostgreSQL.

### Fase 15. Consultas y operaciones con Prisma Client

**Objetivo:** recuperar, registrar, actualizar y eliminar información mediante Prisma Client.

Actividades:

- Crear registros con `create`.
- Consultar registros con `findMany`, `findUnique` y `findFirst`.
- Actualizar información con `update` y `updateMany`.
- Eliminar registros con `delete` y `deleteMany`.
- Aplicar filtros, ordenamientos y paginación.
- Consultar relaciones mediante `include` y `select`.
- Utilizar operaciones de agregación y agrupación.
- Implementar transacciones cuando sean necesarias.
- Utilizar consultas SQL parametrizadas mediante `$queryRaw` únicamente cuando el caso lo justifique.

**Resultado esperado:** operaciones de persistencia que respondan a los requerimientos del sistema y respeten las reglas de negocio.

## 6. Orden general de implementación

El flujo recomendado es:

| Orden | Actividad | Herramienta |
|---|---|---|
| 1 | Configurar el entorno | Node.js y TypeScript |
| 2 | Configurar PostgreSQL y Prisma | Prisma ORM |
| 3 | Definir los modelos | `schema.prisma` |
| 4 | Crear la estructura de la base de datos | Prisma Migrate |
| 5 | Insertar datos iniciales | `seed.ts` |
| 6 | Implementar rutas y controladores | Express |
| 7 | Implementar lógica de aplicación | Services y Prisma Client |
| 8 | Validar datos de entrada | Zod |
| 9 | Evaluar funcionalidades de seguridad opcionales | Autenticación y hashing de contraseñas, si el proyecto lo requiere |
| 10 | Ejecutar pruebas | Tests |
| 11 | Documentar la API | Swagger/OpenAPI, cuando corresponda |

El orden podrá ajustarse de acuerdo con los requerimientos y el alcance de cada proyecto.

## 7. Validación del proyecto

Antes de considerar terminado el ejercicio, verificar:

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
- [ ] La autenticación y autorización se validan si se implementan como funcionalidades del proyecto derivado.
- [ ] Las consultas y operaciones de Prisma producen resultados esperados.
- [ ] Las pruebas están ejecutadas.
- [ ] La documentación está actualizada.

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

- `docs: add business requirements`
- `docs: document database relationships`
- `feat: configure prisma schema`
- `feat: create initial database migration`
- `feat: implement patients endpoints`
- `feat: add request validation with zod`
- `test: validate patient endpoints`
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
- Aplicar validaciones tanto en la aplicación como en la base de datos cuando corresponda.
- Mantener separadas las responsabilidades del backend.
- Validar las funcionalidades mediante pruebas.
- Mantener los archivos organizados y reproducibles.
- Utilizar control de versiones desde el inicio del proyecto.

## 10. Autor

**Gustavo Andrés Santoyo Benavides**

FUNVAL — Full Stack Development

Database Design and Full Stack API Implementation Practice.