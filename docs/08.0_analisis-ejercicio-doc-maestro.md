# FUNVAL — Clínica Salud Integral

## Documento maestro exhaustivo de requisitos del entregable final

Versión: 2.0 — Consolidación de requisitos originales disponibles
Estado: Línea base documental para auditoría y verificación
Alcance: Ejercicio académico Backend Persistente con Prisma — Clínica Salud Integral
Regla de uso: Este documento reconstruye las indicaciones originales disponibles. No incorpora como obligaciones las decisiones posteriores del equipo.

## Control del documento

### Propósito

Consolidar los requisitos funcionales, técnicos, de seguridad, pruebas y entregables que FUNVAL solicita para desarrollar la API de Clínica Salud Integral. Servirá como línea base independiente para:

Auditar el documento de requerimientos del equipo.

Detectar requisitos omitidos, contradicciones y ampliaciones.

Comparar la implementación con el ejercicio original.

Corregir documentación y código de manera controlada, una vez aprobado el diagnóstico.

### Reglas de interpretación

No inventar requisitos.

No convertir una inferencia en requisito explícito.

Distinguir requerimiento funcional, ejemplo técnico, recomendación y desafío extra.

Mantener visibles las ambigüedades y contradicciones.

No utilizar el código actual del equipo como fuente para determinar lo que FUNVAL solicitó.

La presencia de una ruta o fragmento de código en el kit no equivale automáticamente a una política de negocio.

Los nombres de campos de los ejemplos pueden adaptarse cuando FUNVAL así lo indica.

Los códigos HTTP indicados en pruebas o ejemplos se conservan como comportamiento esperado cuando están expresamente documentados.

Cuando no exista evidencia en el material disponible, indicar NO ESPECIFICADO.

### Clasificación obligatoria

| Categoría | Significado |
| --- | --- |
| EXPLÍCITO | FUNVAL lo solicita directamente en el enunciado o instrucción. |
| IMPLÍCITO | Es necesario para cumplir una funcionalidad solicitada, aunque no esté expresado literalmente. |
| EJEMPLO TÉCNICO | FUNVAL muestra una implementación concreta o una forma de resolverlo; no necesariamente obliga a conservar cada detalle de código. |
| RECOMENDACIÓN | Sugerencia técnica o de desarrollo. |
| DESAFÍO EXTRA | Funcionalidad adicional u opcional, separada del alcance obligatorio. |
| NO ESPECIFICADO | Las fuentes disponibles no permiten determinar el comportamiento. |

# 1. Resumen ejecutivo

## 1.1 Problema de negocio

La Clínica Salud Integral utiliza hojas de cálculo para gestionar información y citas. Este mecanismo provoca pérdida de información y cruces de horarios. El proyecto busca construir el núcleo de una API REST para centralizar la información y servir como base de futuras aplicaciones para recepción, consultorio y gerencia.

La mención de cruces de horarios forma parte del contexto del problema. Sin embargo, el material disponible no define una regla completa de duración, intervalos, disponibilidad o detección de traslapes. No debe deducirse una política de agenda más específica sin evidencia.

## 1.2 Objetivo general

Desarrollar una API RESTful persistente para administrar pacientes, médicos, especialidades y citas, ofrecer consulta de agendas y generar reportes operativos, incorporando autenticación y autorización por roles.

## 1.3 Módulos de negocio

Recepción: registro de pacientes, consulta de pacientes y expedientes, consulta y filtrado del directorio de médicos.

Consultorio: programación de citas, consulta de agenda por médico y actualización del estado de las citas.

Gerencia: reporte de volumen de citas por especialidad y corte operativo diario.

Transversal: autenticación, autorización, persistencia relacional, validación y documentación de la API.

## 1.4 Alcance obligatorio resumido

Registrar pacientes.

Validar formato de correo y fecha de nacimiento no futura.

Consultar pacientes y expediente completo.

Consultar médicos y filtrar por especialidad.

Modelar especialidades de forma normalizada y sembrar datos iniciales.

Programar citas para pacientes y médicos existentes.

Rechazar citas en el pasado.

Consultar agenda por rango de fechas.

Iniciar citas en estado PROGRAMADA.

Permitir al médico actualizar a COMPLETADA o CANCELADA.

Generar reportes por especialidad y corte diario.

Implementar JWT, bcryptjs y autorización por rol.

Usar TypeScript, Express, PostgreSQL, Prisma y Zod.

Documentar endpoints con Swagger.

Seguir el flujo Git/PR y realizar pruebas del flujo integral.

## 1.5 Alcance adicional

El reto extra del viernes incorpora la relación opcional entre User y Doctor para restringir al médico autenticado a su propia agenda y sus propias citas. No debe confundirse con el alcance obligatorio.

# 2. Inventario de funcionalidades por módulo

## 2.1 Recepción — pacientes

| ID | Requisito | Clasificación | Evidencia disponible |
| --- | --- | --- | --- |
| REC-01 | Registrar pacientes nuevos. | EXPLÍCITO | Caso de negocio; martes. |
| REC-02 | Capturar información personal del paciente. | EXPLÍCITO | Caso de negocio. |
| REC-03 | Rechazar correos con formato inválido. | EXPLÍCITO | Caso de negocio; prueba martes. |
| REC-04 | Rechazar fechas de nacimiento futuras. | EXPLÍCITO | Caso de negocio; prueba martes. |
| REC-05 | Consultar listado de pacientes. | EJEMPLO TÉCNICO | Función getAllPatients y endpoint de martes. |
| REC-06 | Consultar paciente por identificador. | EXPLÍCITO / EJEMPLO TÉCNICO | Expediente y endpoint GET /api/patients/:id. |
| REC-07 | Consultar datos personales e historial completo. | EXPLÍCITO | Caso de negocio; miércoles. |
| REC-08 | Incluir médico y especialidad en cada cita del historial. | EJEMPLO TÉCNICO | Consulta anidada de miércoles. |
| REC-09 | Ordenar el historial por fecha programada descendente. | EJEMPLO TÉCNICO con resultado esperado | Ejemplo de miércoles. |
| REC-10 | Devolver appointments: [] si no hay citas. | EJEMPLO TÉCNICO con resultado esperado | Prueba de miércoles. |

Campos mostrados en el ejemplo Zod:

firstName: nombre, string no vacío.

lastName: apellido, string no vacío.

email: correo válido.

birthDate: fecha válida y no futura.

FUNVAL indica que los nombres de campos son ejemplos y que pueden adaptarse al modelo propio. No se debe asumir que estos nombres son la única nomenclatura aceptada.

No especificado: actualización y eliminación de pacientes, paginación, búsqueda por nombre, búsqueda por correo, unicidad del correo de paciente y campos adicionales como teléfono o domicilio.

## 2.2 Recepción — directorio de médicos

| ID | Requisito | Clasificación | Evidencia disponible |
| --- | --- | --- | --- |
| DOC-01 | Consultar todos los médicos de la clínica. | EXPLÍCITO | Caso de negocio; martes. |
| DOC-02 | Filtrar médicos por especialidad. | EXPLÍCITO | Caso de negocio; martes. |
| DOC-03 | Recibir especialidad mediante query string. | EJEMPLO TÉCNICO | GET /api/doctors?specialty=.... |
| DOC-04 | Incluir especialidad en la respuesta del directorio. | EJEMPLO TÉCNICO | Consulta Prisma del martes. |
| DOC-05 | Comparar nombre de especialidad sin distinguir mayúsculas/minúsculas. | EJEMPLO TÉCNICO | Filtro Prisma con mode: 'insensitive'. |
| DOC-06 | Mantener directorio de médicos como consulta de solo lectura. | EXPLÍCITO en el alcance del martes | No se solicita CRUD administrativo. |

No se solicita crear, actualizar ni eliminar médicos mediante endpoints de negocio.

## 2.3 Especialidades

| ID | Requisito | Clasificación | Evidencia disponible |
| --- | --- | --- | --- |
| ESP-01 | Modelar especialidades como parte del dominio. | EXPLÍCITO | Diseño de base de datos; lunes. |
| ESP-02 | Normalizar especialidades en entidad propia. | RECOMENDACIÓN / orientación expresa | Pregunta de diseño sobre entidad propia y listado sin médicos. |
| ESP-03 | Poder listar especialidades aunque no tengan médicos asignados. | EXPLÍCITO como objetivo del diseño | Instrucción de modelado del lunes. |
| ESP-04 | Sembrar al menos tres especialidades. | EXPLÍCITO | Lunes, seed. |
| ESP-05 | Sembrar al menos dos médicos por especialidad. | EXPLÍCITO | Lunes, seed. |
| ESP-06 | Crear endpoint GET /api/specialties para verificación. | EJEMPLO TÉCNICO / verificación solicitada | Lunes. |

El endpoint de especialidades se usa como primera verificación del modelo y seed. No equivale a una solicitud de CRUD administrativo de especialidades.

No especificado: operaciones de alta, actualización o eliminación de especialidades; unicidad del nombre; atributos completos de la entidad; política de administración del catálogo.

## 2.4 Consultorio — programación de citas

| ID | Requisito | Clasificación | Evidencia disponible |
| --- | --- | --- | --- |
| CIT-01 | Programar cita para un paciente con un médico específico. | EXPLÍCITO | Caso de negocio; jueves. |
| CIT-02 | Asociar una cita con un paciente existente. | EXPLÍCITO / EJEMPLO TÉCNICO | Campos y validación del jueves. |
| CIT-03 | Asociar una cita con un médico existente. | EXPLÍCITO / EJEMPLO TÉCNICO | Campos y validación del jueves. |
| CIT-04 | Registrar fecha y hora programada. | EXPLÍCITO | Caso de negocio; scheduledAt. |
| CIT-05 | Permitir motivo opcional si se utiliza reason. | EJEMPLO TÉCNICO | Schema de cita del jueves. |
| CIT-06 | Rechazar una cita en fecha/hora pasada. | EXPLÍCITO | Caso de negocio; jueves; prueba. |
| CIT-07 | Responder 404 si no existe el paciente relacionado. | EXPLÍCITO en instrucción técnica | Jueves. |
| CIT-08 | Responder 404 si no existe el médico relacionado. | EXPLÍCITO en instrucción técnica | Jueves. |
| CIT-09 | Crear la cita con estado inicial PROGRAMADA. | EXPLÍCITO | Caso de negocio; schema y prueba. |
| CIT-10 | No recibir el estado inicial en el body y utilizar el default de base de datos. | EJEMPLO TÉCNICO | Jueves. |
| CIT-11 | Responder 201 al crear correctamente. | EJEMPLO TÉCNICO / prueba esperada | Jueves. |

FUNVAL indica que el enunciado no asigna expresamente quién programa las citas. El desarrollador debe decidir qué rol o roles pueden hacerlo y proteger la ruta de acuerdo con esa decisión.

No especificado: duración de la cita, traslapes, disponibilidad, citas consecutivas, horario laboral, vacaciones, bloqueos, zona horaria y regla de cancelación que libere un espacio.

## 2.5 Consultorio — agenda médica

| ID | Requisito | Clasificación | Evidencia disponible |
| --- | --- | --- | --- |
| AGE-01 | El médico consulta sus pacientes programados. | EXPLÍCITO | Caso de negocio; jueves. |
| AGE-02 | Consultar agenda por fecha inicial y final. | EXPLÍCITO | Caso de negocio. |
| AGE-03 | Usar GET /api/doctors/:id/appointments. | EJEMPLO TÉCNICO | Jueves. |
| AGE-04 | Aplicar filtro si se proporcionan from y to. | EJEMPLO TÉCNICO | Jueves. |
| AGE-05 | Utilizar límites gte y lte en el ejemplo. | EJEMPLO TÉCNICO | Jueves. |
| AGE-06 | Si no llegan ambos parámetros, devolver agenda completa. | EJEMPLO TÉCNICO | Jueves. |
| AGE-07 | Incluir paciente relacionado. | EJEMPLO TÉCNICO | Consulta Prisma del jueves. |
| AGE-08 | Ordenar agenda por fecha ascendente. | EJEMPLO TÉCNICO | Consulta Prisma del jueves. |
| AGE-09 | Proteger endpoint con rol MEDICO. | EXPLÍCITO | Jueves. |

Si llega solamente from o solamente to, el ejemplo no aplica el rango. No se especifica otro comportamiento.

## 2.6 Consultorio — estados de cita

| ID | Requisito | Clasificación | Evidencia disponible |
| --- | --- | --- | --- |
| EST-01 | Estado inicial PROGRAMADA. | EXPLÍCITO | Caso de negocio. |
| EST-02 | Estado COMPLETADA. | EXPLÍCITO | Caso de negocio. |
| EST-03 | Estado CANCELADA. | EXPLÍCITO | Caso de negocio. |
| EST-04 | El médico actualiza el estado. | EXPLÍCITO | Caso de negocio; jueves. |
| EST-05 | Utilizar PATCH /api/appointments/:id/status. | EJEMPLO TÉCNICO | Jueves. |
| EST-06 | El body de actualización acepta COMPLETADA o CANCELADA. | EJEMPLO TÉCNICO | Schema del jueves. |
| EST-07 | Responder 404 si la cita no existe. | EXPLÍCITO | Jueves y prueba. |
| EST-08 | Proteger la ruta con rol MEDICO. | EXPLÍCITO | Jueves. |

No se definen transiciones posteriores desde estados finales, reapertura, cancelación por recepción ni historial de cambios.

## 2.7 Gerencia — reportes

| ID | Requisito | Clasificación | Evidencia disponible |
| --- | --- | --- | --- |
| REP-01 | Reportar total de citas agrupadas por especialidad. | EXPLÍCITO | Caso de negocio; viernes. |
| REP-02 | Reportar corte operativo de una fecha. | EXPLÍCITO | Caso de negocio; viernes. |
| REP-03 | Contar citas COMPLETADA. | EXPLÍCITO | Caso de negocio. |
| REP-04 | Contar citas CANCELADA. | EXPLÍCITO | Caso de negocio. |
| REP-05 | Usar endpoint /api/reports/appointments-by-specialty. | EJEMPLO TÉCNICO | Viernes. |
| REP-06 | Agrupar y ordenar de mayor a menor. | EJEMPLO TÉCNICO | SQL del viernes. |
| REP-07 | Usar $queryRaw parametrizado para consulta entre relaciones. | EJEMPLO TÉCNICO con precaución de seguridad | Viernes. |
| REP-08 | Usar endpoint /api/reports/daily-cutoff?date=.... | EJEMPLO TÉCNICO | Viernes. |
| REP-09 | Agrupar por estado con groupBy. | EJEMPLO TÉCNICO | Viernes. |
| REP-10 | Filtrar estados COMPLETADA y CANCELADA. | EXPLÍCITO | Caso de negocio y código. |
| REP-11 | Filtrar por scheduledAt dentro del día. | EJEMPLO TÉCNICO | Código del viernes. |
| REP-12 | Proteger ambos reportes con GERENCIA. | EXPLÍCITO | Viernes. |

Precisiones:

El título menciona rentabilidad, pero el requisito descrito y el SQL calculan volumen de citas. No se proporcionan datos financieros.

El SQL por especialidad usa INNER JOIN; no se exige incluir especialidades con cero citas en el reporte.

El corte diario se filtra por fecha programada (scheduledAt), aunque la descripción puede interpretarse como fecha en que se completó o canceló. La diferencia debe permanecer registrada.

El ejemplo usa 00:00:00 y 23:59:59 para el día; no define zona horaria.

# 3. Actores, roles y permisos

## 3.1 Actores

| Actor | Responsabilidad de negocio |
| --- | --- |
| Recepcionista | Atención de recepción, registro y consulta de pacientes, consulta del directorio médico. |
| Médico | Consulta de agenda y actualización de estado de citas. |
| Gerencia | Consulta de reportes operativos. |
| Sistema/API | Autenticación, autorización, validación y persistencia. Es un componente técnico, no un rol humano. |

## 3.2 Matriz de permisos

| Operación | RECEPCIONISTA | MEDICO | GERENCIA | Observación |
| --- | --- | --- | --- | --- |
| Registrar paciente | Sí | No indicado | No indicado | Ruta protegida para RECEPCIONISTA. |
| Listar pacientes | Sí | No indicado | No indicado | Ruta protegida para RECEPCIONISTA. |
| Consultar expediente | Sí | No indicado | No indicado | Ruta protegida para RECEPCIONISTA. |
| Consultar médicos | Sí | No indicado | No indicado | Directorio de recepción. |
| Filtrar médicos | Sí | No indicado | No indicado | Directorio de recepción. |
| Programar citas | A decisión del desarrollador | A decisión del desarrollador | A decisión del desarrollador | FUNVAL no asigna actor. |
| Consultar agenda | No indicado | Sí | No indicado | Protegida con MEDICO. |
| Actualizar estado | No indicado | Sí | No indicado | Protegida con MEDICO. |
| Reporte por especialidad | No indicado | No indicado | Sí | Protegida con GERENCIA. |
| Corte diario | No indicado | No indicado | Sí | Protegida con GERENCIA. |

“No indicado” no significa necesariamente “prohibido”; significa que el ejercicio no asigna ese permiso. No se deben inferir permisos adicionales por la sola existencia de un rol.

## 3.3 Registro de usuarios y asignación de roles

El kit de autenticación muestra un controlador de registro que:

Recibe email, password y role.

Genera hash con bcrypt.hash(password, 10).

Crea un registro User.

Selecciona y devuelve id, email y role, sin devolver password.

Responde 201 en caso exitoso.

La ruta de ejemplo es POST /register y no incluye verifyToken ni authorize.

Conclusiones permitidas:

El ejemplo técnico presenta una ruta de registro sin autenticación previa.

El body del ejemplo contiene el rol.

La prueba de FUNVAL espera registro exitoso con 201.

No se puede concluir como política de negocio:

Que la clínica deba permitir autorregistro público en producción.

Que cualquier usuario deba elegir libremente su rol.

Que GERENCIA deba crear todas las cuentas.

Que la primera cuenta GERENCIA deba crearse por seed o bootstrap.

Que exista un endpoint administrativo de gestión de usuarios.

Estas políticas están NO ESPECIFICADAS.

# 4. Entidades, atributos y relaciones

## 4.1 Entidades identificadas

| Entidad | Tipo | Atributos identificados | Observación |
| --- | --- | --- | --- |
| Patient | Negocio | id (necesario para identificar), firstName, lastName, email, birthDate | Los cuatro últimos aparecen en el ejemplo; adaptar nombres permitido. |
| Doctor | Negocio | id; specialtyId o relación con Specialty | El ejemplo SQL utiliza doctors.id y doctors.specialty_id. Atributos completos NO ESPECIFICADOS. |
| Specialty | Negocio | id; name | El ejemplo SQL utiliza specialties.id y specialties.name. |
| Appointment | Negocio | id; patientId; doctorId; scheduledAt; reason opcional; status | Campos mostrados en el schema y SQL de ejemplo. |
| User | Técnica/autenticación | id; email; password; role | Modelo proporcionado por FUNVAL. |

## 4.2 Modelo User proporcionado

id: entero, llave primaria, autoincremental.

email: string, único.

password: string.

role: enum Role.

Role: RECEPCIONISTA, MEDICO, GERENCIA.

FUNVAL permite agregar campos para adaptar el modelo, por ejemplo nombre y apellido.

## 4.3 Campos del ejemplo Appointment

patientId: entero positivo.

doctorId: entero positivo.

scheduledAt: fecha válida no pasada.

reason: string opcional.

status: enum con default PROGRAMADA.

El estado no se recibe en el body al crear la cita, de acuerdo con el ejemplo.

## 4.4 Relaciones identificadas

| Relación | Cardinalidad sustentada | Observación |
| --- | --- | --- |
| Specialty — Doctor | Una especialidad puede tener varios médicos; el caso contempla médicos pertenecientes a una especialidad. | La normalización y el SQL respaldan specialty_id. |
| Patient — Appointment | Un paciente puede tener varias citas; cada cita se asocia a un paciente. | Historial y patientId. |
| Doctor — Appointment | Un médico puede tener varias citas; cada cita se asocia a un médico. | Agenda y doctorId. |
| User — Doctor | Relación opcional. | Solo DESAFÍO EXTRA. |

## 4.5 Cardinalidades y restricciones no definidas

No se presenta diagrama ER obligatorio ya resuelto.

No se especifican todos los atributos de Doctor y Specialty.

No se define si una especialidad puede estar asignada a cero médicos en el seed, aunque el modelo debe permitir listar especialidades sin médicos.

No se establece unicidad del correo de Patient.

No se establece unicidad de cédula profesional.

No se establece unicidad del nombre de Specialty.

No se establece que un médico tenga una sola cuenta de usuario.

La relación User–Doctor es opcional en el reto extra.

# 5. Inventario de endpoints y operaciones

| Método | Endpoint | Operación | Protección indicada |
| --- | --- | --- | --- |
| POST | /api/auth/register | Registrar usuario | Sin middleware en ejemplo |
| POST | /api/auth/login | Iniciar sesión | Sin middleware en ejemplo |
| POST | /api/patients | Registrar paciente | RECEPCIONISTA |
| GET | /api/patients | Listar pacientes | RECEPCIONISTA |
| GET | /api/patients/:id | Consultar expediente | RECEPCIONISTA |
| GET | /api/doctors | Directorio de médicos | RECEPCIONISTA |
| GET | /api/doctors?specialty=... | Filtrar médicos | RECEPCIONISTA |
| POST | /api/appointments | Crear cita | Rol a elección del desarrollador |
| GET | /api/doctors/:id/appointments?from=&to= | Consultar agenda | MEDICO |
| PATCH | /api/appointments/:id/status | Actualizar estado | MEDICO |
| GET | /api/reports/appointments-by-specialty | Reporte por especialidad | GERENCIA |
| GET | /api/reports/daily-cutoff?date=YYYY-MM-DD | Corte diario | GERENCIA |
| GET | /api/specialties | Verificación del catálogo | Endpoint de verificación del lunes |

## 5.1 Endpoints no solicitados en el material disponible

No aparecen como entregables del ejercicio:

CRUD de pacientes.

CRUD de médicos.

CRUD de especialidades.

Administración de usuarios por GERENCIA.

Asignación administrativa de médico a usuario.

Recuperación de contraseña.

Cambio de contraseña.

Logout.

Refresh token.

Consulta de historial de auditoría.

Reportes financieros.

# 6. Reglas de negocio

| ID | Regla | Clasificación |
| --- | --- | --- |
| RN-01 | El correo del paciente debe tener formato válido. | EXPLÍCITO |
| RN-02 | La fecha de nacimiento no puede ser futura. | EXPLÍCITO |
| RN-03 | La cita se asocia con un paciente. | EXPLÍCITO |
| RN-04 | La cita se asocia con un médico. | EXPLÍCITO |
| RN-05 | La cita debe tener fecha y hora programada. | EXPLÍCITO |
| RN-06 | No se permite programar una cita en el pasado. | EXPLÍCITO |
| RN-07 | La cita nueva inicia en PROGRAMADA. | EXPLÍCITO |
| RN-08 | El médico puede actualizar a COMPLETADA. | EXPLÍCITO |
| RN-09 | El médico puede actualizar a CANCELADA cuando el paciente no llega. | EXPLÍCITO |
| RN-10 | Los estados disponibles son PROGRAMADA, COMPLETADA, CANCELADA. | EXPLÍCITO |
| RN-11 | Antes de crear una cita se verifica que exista el paciente. | EJEMPLO TÉCNICO / instrucción concreta |
| RN-12 | Antes de crear una cita se verifica que exista el médico. | EJEMPLO TÉCNICO / instrucción concreta |
| RN-13 | El expediente contiene todas las citas del paciente. | EXPLÍCITO |
| RN-14 | El historial se ordena por fecha descendente en el ejemplo. | EJEMPLO TÉCNICO |
| RN-15 | La agenda se ordena por fecha ascendente en el ejemplo. | EJEMPLO TÉCNICO |
| RN-16 | Las rutas se protegen por rol según el módulo. | EXPLÍCITO |
| RN-17 | Los reportes se restringen a GERENCIA. | EXPLÍCITO |
| RN-18 | El médico solo accede a sus propios recursos. | DESAFÍO EXTRA |

## 6.1 Reglas NO ESPECIFICADAS

Duración de cita.

Traslape por médico.

Traslape por paciente.

Citas consecutivas.

Horario laboral.

Vacaciones, ausencias y bloqueos.

Zona horaria.

Cancelación que libere espacio.

Reapertura o modificación de estados finales.

Historial de cambios de estado.

Unicidad de correo de paciente.

Unicidad de licencia profesional.

Unicidad de especialidad.

Número máximo de cuentas por médico.

# 7. Validaciones y respuestas HTTP

## 7.1 Pacientes

| Dato o escenario | Validación / resultado |
| --- | --- |
| firstName | String no vacío en el ejemplo. |
| lastName | String no vacío en el ejemplo. |
| email | Formato válido; inválido produce 400 en prueba. |
| birthDate | Fecha válida y no futura; futura produce 400. |
| Crear paciente válido | 201 en prueba. |
| Paciente inexistente | 404 en consulta individual del ejemplo. |

## 7.2 Citas

| Dato o escenario | Validación / resultado |
| --- | --- |
| patientId | Entero positivo en el ejemplo. |
| doctorId | Entero positivo en el ejemplo. |
| scheduledAt | Fecha no pasada; fecha pasada produce 400. |
| reason | Opcional en el ejemplo. |
| Paciente inexistente | 404. |
| Médico inexistente | 404. |
| Creación válida | 201 y estado PROGRAMADA. |
| Estado enviado al crear | No se recibe en body; default de base de datos. |
| Estado al actualizar | COMPLETADA o CANCELADA. |
| Cita inexistente al actualizar | 404. |

## 7.3 Autenticación y autorización

| Escenario | Resultado |
| --- | --- |
| Registro válido | 201 |
| Login válido | 200 y token |
| Sin token en ruta protegida | 401 |
| Token inválido o expirado | 401 |
| Usuario autenticado sin rol permitido | 403 |
| Credenciales incorrectas | 401 en el ejemplo |
| Error interno | 500 en los catch del ejemplo |

## 7.4 Reportes

Validar parámetro date en formato YYYY-MM-DD.

El ejemplo utiliza z.string().date() o expresión regular.

No se define un código HTTP concreto para todos los errores de fecha; el comportamiento exacto debe revisarse en el controlador de referencia disponible.

## 7.5 Unicidad

User.email es único en el modelo entregado.

La unicidad de Patient.email no está especificada.

La unicidad de licencia profesional no está especificada.

La unicidad de nombre de especialidad no está especificada.

# 8. Consultas y reportes técnicos

## 8.1 Directorio de médicos

Comportamiento del ejemplo Prisma:

Sin filtro, devuelve todos los médicos.

Con specialty, filtra por nombre de especialidad.

Incluye la especialidad.

La comparación es insensible a mayúsculas/minúsculas.

## 8.2 Expediente del paciente

Consulta anidada:

Patient → appointments → doctor → specialty

Comportamiento:

Historial completo.

Orden scheduledAt DESC.

Colección vacía [] cuando no hay citas.

No devolver null para la colección de citas.

## 8.3 Agenda médica

Comportamiento:

Filtro por doctorId.

Si llegan from y to, usar scheduledAt: { gte: from, lte: to }.

Si no llegan ambos, no aplicar filtro temporal.

Incluir paciente.

Ordenar por scheduledAt ASC.

Protección con MEDICO.

## 8.4 Reporte por especialidad

SQL de referencia:

SELECT s.name AS specialty, COUNT(a.id)::int AS total_appointments
FROM appointments a
INNER JOIN doctors d ON d.id = a.doctor_id
INNER JOIN specialties s ON s.id = d.specialty_id
GROUP BY s.name
ORDER BY total_appointments DESC

Requisitos y características:

Contar citas agrupadas por especialidad.

Relacionar appointments, doctors y specialties.

Ordenar descendente.

El ejemplo no filtra por estado.

Usar $queryRaw con template parametrizado.

Proteger con GERENCIA.

El INNER JOIN no muestra especialidades sin citas.

## 8.5 Corte diario

Comportamiento del ejemplo Prisma:

Recibir date como YYYY-MM-DD.

Construir inicio del día 00:00:00.

Construir final del día 23:59:59.

Filtrar por scheduledAt.

Incluir únicamente COMPLETADA y CANCELADA.

Agrupar por status mediante groupBy.

Contar registros por estado.

Proteger con GERENCIA.

Ambigüedad: la descripción habla de citas completadas y canceladas ese día, pero el ejemplo filtra por fecha programada, no por fecha de actualización del estado.

# 9. Requisitos técnicos y arquitectura

## 9.1 Tecnologías

| Tecnología | Uso |
| --- | --- |
| Node.js | Entorno de ejecución |
| TypeScript | Lenguaje |
| Express | Framework HTTP |
| PostgreSQL | Base de datos relacional |
| Prisma ORM | ORM y cliente de acceso a datos |
| Zod | Validación |
| jsonwebtoken | JWT |
| bcryptjs | Hash y comparación de contraseñas |
| Swagger UI / swagger-autogen | Documentación de API |
| Git / GitHub | Control de versiones y PR |

## 9.2 Prisma 7 y configuración PostgreSQL

El ejercicio incluye estas piezas de configuración:

Paquetes prisma, @prisma/client, @prisma/adapter-pg, pg y dotenv.

Archivo prisma.config.ts.

Configuración de ruta del schema y migraciones.

Variable DATABASE_URL.

Generación de Prisma Client en la ruta indicada por el ejercicio.

PrismaPg como driver adapter.

datasource db con proveedor PostgreSQL.

Migraciones mediante prisma migrate dev.

Generación del cliente.

Instancia centralizada de Prisma Client.

Prisma Studio para inspección de tablas.

La configuración exacta debe conservarse conforme al material de Prisma 7 utilizado en el ejercicio, sin sustituirla por instrucciones de otras versiones.

## 9.3 Modelo y mapeo

Diseñar el esquema de negocio desde cero.

Mantener relaciones normalizadas.

Definir enum de estados.

Definir enum de roles.

Mapear nombres a snake_case mediante @map y @@map.

Mantener el modelo User proporcionado.

Generar tipos desde Prisma Client.

## 9.4 Arquitectura MVC

Organización trabajada:

src/models/: operaciones de acceso a datos mediante Prisma.

src/controllers/: manejo de request/response.

src/routes/: definición de endpoints y middleware.

src/middlewares/: autenticación, autorización y validaciones.

src/config/: configuración e instancia de Prisma.

Schemas de validación organizados según la estructura del proyecto.

Services puede utilizarse cuando corresponda a la organización elegida; no se impone como capa obligatoria separada en todos los módulos.

## 9.5 Variables de entorno y Git

Variables mostradas:

DATABASE_URL

JWT_SECRET

PORT (el ejemplo usa 3000).

Reglas:

Configurar .env.

Incluir .env en .gitignore.

No subir secretos al repositorio.

Utilizar dotenv donde corresponda.

## 9.6 Calidad y documentación

Mantener tipado TypeScript.

Evitar any.

Utilizar tipos generados por Prisma.

Validar entradas con Zod.

Documentar endpoints mediante Swagger.

Configurar Bearer Auth en Swagger.

Verificar rutas protegidas.

Probar el flujo completo.

## 9.7 Despliegue

NO ESPECIFICADO en el material disponible. No se define proveedor cloud ni despliegue de producción.

# 10. Seguridad y autenticación

## 10.1 Hash de contraseñas

El ejemplo usa bcryptjs:

bcrypt.hash(password, 10) al registrar.

bcrypt.compare(password, user.password) al iniciar sesión.

No devolver el campo password en la respuesta de registro.

## 10.2 JWT

El ejemplo:

Emite con jwt.sign.

Verifica con jwt.verify.

Usa JWT_SECRET.

Define expiración 8h.

Incluye id, email y role en el payload.

Envía el token como Authorization: Bearer <token>.

## 10.3 Middleware de autenticación

verifyToken:

Lee el encabezado Authorization.

Comprueba el formato Bearer.

Verifica el token.

Recupera la identidad y rol del usuario autenticado.

Rechaza ausencia o invalidez con 401.

## 10.4 Middleware de autorización

authorize(...roles):

Comprueba si el rol autenticado está entre los permitidos.

Responde 403 cuando el usuario no tiene el rol autorizado.

## 10.5 Protección por rutas

Pacientes y directorio de médicos: RECEPCIONISTA.

Agenda: MEDICO.

Actualización de estado: MEDICO.

Reportes: GERENCIA.

Programación de citas: rol por decisión del desarrollador.

Registro y login: sin middleware en las rutas del ejemplo.

## 10.6 Seguridad NO ESPECIFICADA

Política de autorregistro de producción.

Quién puede crear cuentas en la operación real.

Quién asigna roles.

Bootstrap de GERENCIA.

Recuperación de contraseña.

Cambio de contraseña.

Refresh token.

Revocación de JWT.

Rate limiting.

Bloqueo de cuentas.

Política de contraseñas complejas.

Auditoría de accesos.

Protección por propiedad de recursos en el alcance principal.

# 11. Pruebas y criterios de aceptación

## 11.1 Lunes — setup, modelo y seed

| Escenario | Resultado esperado |
| --- | --- |
| Ejecutar migración inicial | Tablas creadas y Prisma Client generado |
| Ejecutar seed | Al menos 3 especialidades y 2 médicos por especialidad |
| Consultar GET /api/specialties | Datos de especialidades disponibles |
| Abrir Prisma Studio | Verificar tablas y relaciones |

## 11.2 Martes — pacientes y médicos

| Escenario | Resultado esperado |
| --- | --- |
| Correo mal formado al crear paciente | 400 |
| Fecha de nacimiento futura | 400 |
| Registro de paciente válido | 201 |
| GET /api/doctors | Todos los médicos con especialidad |
| GET /api/doctors?specialty=Pediatría | Médicos de esa especialidad |

## 11.3 Miércoles — expediente y autenticación

| Escenario | Resultado esperado |
| --- | --- |
| Consultar paciente con citas | Datos, citas, médico y especialidad |
| Consultar paciente sin citas | appointments: [] |
| Registrar usuario | 201 |
| Login con credenciales registradas | 200 y token |
| Consultar pacientes sin token | 401 |
| Consultar pacientes con token RECEPCIONISTA | 200 |
| Consultar pacientes con token MEDICO | 403 |

## 11.4 Jueves — citas

| Escenario | Resultado esperado |
| --- | --- |
| Crear cita en fecha pasada | 400 |
| Crear cita con médico inexistente | 404 |
| Crear cita válida | 201 y estado PROGRAMADA |
| Consultar agenda por rango | Citas del rango |
| Actualizar cita a COMPLETADA | 200 |
| Actualizar cita inexistente | 404 |

La instrucción de creación también exige verificar paciente inexistente con 404, aunque la lista de pruebas ejemplificadas destaca expresamente el médico inexistente.

## 11.5 Viernes — reportes y flujo integral

Probar reporte por especialidad.

Probar corte diario.

Verificar orden descendente por volumen.

Verificar agrupación por estado.

Verificar autorización GERENCIA.

Documentar rutas en Swagger.

Verificar ausencia de any.

Verificar tipos generados.

Ejecutar flujo integral:

Registro de usuario → Login → Crear paciente → Agendar cita → Actualizar estado → Consultar reportes

## 11.6 Pruebas no solicitadas expresamente

No convertir en criterios originales:

Traslapes.

Duración de 30 minutos.

Citas consecutivas.

Correo duplicado de paciente.

Cédula profesional duplicada.

Solicitudes concurrentes.

Recuperación de contraseña.

Refresh token.

Pruebas de carga.

Despliegue productivo.

# 12. Entregables cronológicos

El ejercicio organiza el trabajo en cinco jornadas. Las duraciones indicadas en el material son aproximadas: lunes a jueves alrededor de siete horas por día y viernes alrededor de cuatro horas para cierre y entrega.

## 12.1 Lunes — Modelado y setup de Prisma

Actividades:

Releer módulos de negocio.

Crear requerimientos.md en raíz.

Documentar entidades.

Documentar atributos, tipos aproximados, PK, unicidad y obligatoriedad.

Documentar relaciones.

Configurar Express y TypeScript.

Instalar Prisma y driver adapter PostgreSQL.

Configurar prisma.config.ts.

Configurar .env y .gitignore.

Crear schema.prisma.

Agregar modelo User proporcionado.

Ejecutar migración inicial.

Generar Prisma Client.

Sembrar datos.

Crear instancia Prisma Client.

Crear endpoint de verificación.

Verificar tablas y relaciones en Prisma Studio.

Entregables y archivos:

requerimientos.md

prisma/schema.prisma

prisma.config.ts

.env

.gitignore

prisma/migrations/

prisma/seed.ts o seed realizado con Prisma Studio, según el método utilizado

src/config/prisma.ts

Datos mínimos:

3 especialidades.

2 médicos por especialidad.

Endpoint de verificación:

GET /api/specialties

Flujo Git indicado:

git init
git add .
git commit -m "feat: modelado inicial y setup de Prisma para clinica-salud-integral"
git checkout -b feature/modelado-prisma
git remote add origin <tu-repositorio>
git push -u origin feature/modelado-prisma

Abrir PR hacia main; esperar revisión antes del merge.

## 12.2 Martes — Pacientes y directorio de médicos

Precondición: PR del lunes mergeado.

Rama:

git checkout main
git pull origin main
git checkout -b feature/pacientes-medicos

Actividades:

Crear arquitectura MVC.

Crear middleware Zod para pacientes.

Implementar crear, listar y consultar pacientes.

Crear directorio de médicos de solo lectura.

Incluir especialidad.

Filtrar por especialidad mediante query string.

Probar en Swagger o Postman.

Archivos principales:

src/models/patient.model.ts

src/models/doctor.model.ts

src/middlewares/validate-patient.ts

src/controllers/

src/routes/

Commit sugerido:

git add .
git commit -m "feat: CRUD de pacientes y directorio de médicos con Prisma"
git push -u origin feature/pacientes-medicos

Abrir PR hacia main; esperar revisión antes del merge.

## 12.3 Miércoles — Expediente y JWT

Precondición: PR del martes mergeado.

Rama:

git checkout main
git pull origin main
git checkout -b feature/expediente-auth

Actividades:

Modificar consulta individual para incluir historial.

Incluir médico y especialidad.

Ordenar por fecha descendente.

Devolver arreglo vacío sin citas.

Instalar jsonwebtoken y bcryptjs.

Configurar JWT_SECRET.

Implementar verifyToken.

Implementar authorize.

Implementar registro y login.

Crear rutas de autenticación.

Montar /api/auth.

Proteger pacientes y médicos.

Configurar Bearer Auth en Swagger.

Ejecutar pruebas de autenticación y permisos.

Archivos principales:

src/middlewares/auth.middleware.ts

src/middlewares/authorize.middleware.ts

src/controllers/auth.controller.ts

src/routes/auth.routes.ts

src/models/patient.model.ts

Commit sugerido:

git add .
git commit -m "feat: expediente con historial de citas y autenticación con JWT"
git push -u origin feature/expediente-auth

Abrir PR hacia main; esperar revisión antes del merge.

## 12.4 Jueves — Citas

Precondición: PR del miércoles mergeado.

Rama:

git checkout main
git pull origin main
git checkout -b feature/citas

Actividades:

Crear schema Zod de cita.

Crear cita con Prisma Client.

Verificar existencia de paciente y médico.

Usar estado inicial PROGRAMADA.

Crear agenda por rango.

Devolver agenda completa si no llegan ambos límites.

Crear schema de estado.

Actualizar estado con PATCH.

Capturar error P2025 y devolver 404.

Ejecutar pruebas.

Archivos principales:

src/middlewares/validate-appointment.ts

src/models/appointment.model.ts

src/controllers/

src/routes/

Commit sugerido:

git add .
git commit -m "feat: agendamiento de citas, agenda del médico y cambio de estado"
git push -u origin feature/citas

Abrir PR hacia main; esperar revisión antes del merge.

## 12.5 Viernes — Reportes y entrega final

Precondición: PR del jueves mergeado.

Rama:

git checkout main
git pull origin main
git checkout -b feature/reportes

Actividades:

Crear reporte de citas por especialidad.

Usar $queryRaw parametrizado.

Crear corte diario con groupBy.

Validar date.

Documentar controladores en Swagger.

Revisar que no exista any.

Importar tipos generados por Prisma.

Verificar middleware de autenticación y autorización.

Probar flujo integral.

Abrir PR final.

Esperar aprobación y hacer merge antes de la entrega.

Commit sugerido:

git add .
git commit -m "feat: reportes de gerencia y documentación final"
git push -u origin feature/reportes

## 12.6 Entrega final verificable

Modelo Prisma completo.

Migraciones.

Seed.

Instancia de Prisma Client.

Modelos y controladores.

Middlewares Zod.

Middleware JWT y autorización.

Rutas.

Reportes.

Swagger.

.env fuera del repositorio.

Pruebas del flujo integral.

PR final aprobado y mergeado.

Los nombres exactos de archivos son ejemplos indicados por FUNVAL y pueden variar si la organización conserva las responsabilidades y el comportamiento solicitado.

# 13. Desafío extra

## 13.1 Relación User–Doctor y propiedad de recursos

El reto extra propone:

Agregar relación opcional entre User y Doctor, por ejemplo mediante doctorId opcional.

Vincular una cuenta de médico con un registro Doctor.

En la consulta de agenda, comparar el médico de la URL con el médico asociado al usuario autenticado.

Si un médico intenta consultar agenda ajena, responder 403.

Aplicar la misma comprobación al cambio de estado.

Permitir que el médico consulte únicamente su propia agenda y actualice únicamente sus propias citas.

Clasificación: DESAFÍO EXTRA.

No se debe incorporar como requisito obligatorio del ejercicio principal ni inferir una cardinalidad de una cuenta por médico si no se documenta expresamente.

# 14. Ambigüedades, límites y asuntos no especificados

| ID | Tema | Estado documental |
| --- | --- | --- |
| AMB-01 | Actor autorizado para programar citas | El desarrollador decide. |
| AMB-02 | Política de registro público de usuarios | NO ESPECIFICADO como política de negocio; ruta de ejemplo sin protección. |
| AMB-03 | Quién crea cuentas | NO ESPECIFICADO. |
| AMB-04 | Quién asigna roles | El ejemplo recibe role en body; política de autorización NO ESPECIFICADA. |
| AMB-05 | Bootstrap de primera cuenta GERENCIA | NO ESPECIFICADO. |
| AMB-06 | Duración de cita | NO ESPECIFICADO. |
| AMB-07 | Prevención de traslapes | Contexto menciona cruces; regla operativa detallada NO ESPECIFICADA. |
| AMB-08 | Traslape por paciente | NO ESPECIFICADO. |
| AMB-09 | Citas consecutivas | NO ESPECIFICADO. |
| AMB-10 | Horarios laborales | NO ESPECIFICADO. |
| AMB-11 | Vacaciones y ausencias | NO ESPECIFICADO. |
| AMB-12 | Zona horaria | NO ESPECIFICADO. |
| AMB-13 | Atributos completos Doctor | NO ESPECIFICADO. |
| AMB-14 | Atributos completos Specialty | NO ESPECIFICADO. |
| AMB-15 | Unicidad Patient.email | NO ESPECIFICADO. |
| AMB-16 | Unicidad de licencia profesional | NO ESPECIFICADO. |
| AMB-17 | Unicidad de Specialty.name | NO ESPECIFICADO. |
| AMB-18 | Una cuenta por médico | NO ESPECIFICADO. |
| AMB-19 | Fecha del corte diario | El ejemplo filtra scheduledAt; descripción puede interpretarse de otra manera. |
| AMB-20 | Rango con solo from o solo to | El ejemplo no filtra si falta uno; no define alternativa. |
| AMB-21 | Estados finales y reapertura | NO ESPECIFICADO. |
| AMB-22 | Reporte incluye especialidades con cero citas | El SQL usa INNER JOIN; inclusión no especificada. |
| AMB-23 | Paginación | NO ESPECIFICADO. |
| AMB-24 | Actualización o eliminación de pacientes | NO ESPECIFICADO. |
| AMB-25 | Despliegue | NO ESPECIFICADO. |
| AMB-26 | Recuperación y cambio de contraseña | NO ESPECIFICADO. |
| AMB-27 | Refresh token y revocación | NO ESPECIFICADO. |
| AMB-28 | Auditoría de cambios | NO ESPECIFICADO. |

## 14.1 Observaciones que deben conservarse como tales

El título del reporte alude a rentabilidad, pero la funcionalidad y SQL solicitan volumen de citas. No hay datos financieros.

El contexto menciona cruces de horarios, pero no define reglas de traslape.

El registro de usuarios aparece como ruta sin middleware y recibe role, pero no existe una política formal de autorregistro y asignación de roles.

El corte diario se describe por día y estados, pero el ejemplo filtra por fecha programada.

La agenda filtra con gte y lte, ambos inclusivos.

El ejemplo aplica el rango solo cuando recibe ambos parámetros.

El reto extra de propiedad User–Doctor no es parte del alcance base.

# 15. Matriz de trazabilidad de fuentes

La fuente primaria disponible para esta reconstrucción es el enunciado semanal “Backend Persistente con Prisma — Clínica Salud Integral”, que contiene el caso de negocio, instrucciones de lunes a viernes, ejemplos técnicos, pruebas, flujo Git/PR y reto extra.

| Fuente / sección | Contenido que respalda |
| --- | --- |
| Caso de negocio y objetivo | Problema, objetivo y módulos. |
| Lunes — modelado y setup | Entidades, relaciones, normalización, User, Prisma 7, seed, migraciones y endpoint de verificación. |
| Martes — pacientes y médicos | Validaciones, operaciones de pacientes, directorio y filtro de médicos. |
| Miércoles — expediente y autenticación | Historial, orden, arreglo vacío, bcrypt, JWT, middleware, roles, rutas y pruebas. |
| Jueves — citas | Schema, creación, validación de entidades, agenda, rango, estados, protección y pruebas. |
| Viernes — reportes | SQL, $queryRaw, groupBy, corte diario, Swagger, tipos, flujo integral y PR final. |
| Reto extra | Relación User–Doctor y autorización por propiedad. |

## 15.1 Limitaciones de las fuentes disponibles

No se ha comprobado la disponibilidad de:

Material independiente de cada lección diaria que amplíe el enunciado.

Rúbrica oficial separada de evaluación.

Videos completos referenciados en el ejercicio.

Código original del kit como repositorio independiente.

Por tanto, este documento cubre exhaustivamente el enunciado semanal disponible, pero no afirma haber auditado materiales externos no proporcionados.

# 16. Lista maestra de verificación del ejercicio

La siguiente lista puede utilizarse durante la auditoría del código. Cada punto debe marcarse únicamente después de revisar evidencia real.

## 16.1 Base de datos y Prisma

☐ PostgreSQL configurado.

☐ prisma.config.ts configurado.

☐ Driver adapter PostgreSQL configurado.

☐ DATABASE_URL en variables de entorno.

☐ .env excluido de Git.

☐ schema.prisma contiene entidades necesarias.

☐ Modelo User conserva campos y roles.

☐ Enum de estados correcto.

☐ Relaciones entre entidades correctas.

☐ Mapeo snake_case configurado.

☐ Migración ejecutada.

☐ Prisma Client generado.

☐ Instancia centralizada de Prisma Client.

☐ Seed ejecutado.

☐ Tres especialidades como mínimo.

☐ Dos médicos por especialidad como mínimo.

☐ Verificación en Prisma Studio.

☐ GET /api/specialties disponible para verificación.

## 16.2 Pacientes y médicos

☐ POST de pacientes.

☐ GET de pacientes.

☐ GET de paciente por ID.

☐ Validación de correo.

☐ Validación de fecha de nacimiento.

☐ 400 para correo inválido.

☐ 400 para fecha futura.

☐ 201 para registro correcto.

☐ 404 para paciente inexistente.

☐ Expediente incluye historial.

☐ Historial incluye médico.

☐ Historial incluye especialidad.

☐ Historial ordenado descendente.

☐ Historial vacío devuelve [].

☐ GET de médicos.

☐ Filtro por especialidad.

☐ Respuesta incluye especialidad.

☐ Directorio de médicos de solo lectura.

## 16.3 Autenticación y autorización

☐ Registro de usuario.

☐ Hash bcryptjs con factor del ejemplo.

☐ Respuesta de registro no expone password.

☐ Login.

☐ Comparación de contraseña con bcryptjs.

☐ Emisión JWT.

☐ Claims id, email y role.

☐ Expiración de ocho horas en el comportamiento del ejemplo.

☐ JWT_SECRET configurado.

☐ Middleware verifyToken.

☐ Middleware authorize.

☐ Token Bearer.

☐ 401 sin token.

☐ 401 con token inválido.

☐ 403 por rol no autorizado.

☐ Rutas de pacientes y médicos protegidas para RECEPCIONISTA.

☐ Agenda protegida para MEDICO.

☐ Cambio de estado protegido para MEDICO.

☐ Reportes protegidos para GERENCIA.

☐ Decisión de rol para agendar documentada por el desarrollador.

☐ Política de registro no atribuida indebidamente a FUNVAL.

## 16.4 Citas y agenda

☐ POST de citas.

☐ Validación de patientId.

☐ Validación de doctorId.

☐ Validación de scheduledAt.

☐ Verificación de paciente existente.

☐ Verificación de médico existente.

☐ 404 para paciente inexistente.

☐ 404 para médico inexistente.

☐ 400 para fecha pasada.

☐ 201 para cita válida.

☐ Estado inicial PROGRAMADA.

☐ Estado inicial no controlado desde body.

☐ GET de agenda.

☐ Filtro cuando llegan from y to.

☐ Extremos inclusivos según el ejemplo.

☐ Agenda completa cuando no llegan ambos parámetros.

☐ Orden ascendente.

☐ PATCH de estado.

☐ Acepta COMPLETADA y CANCELADA.

☐ 404 para cita inexistente.

## 16.5 Reportes y entrega

☐ Reporte por especialidad.

☐ Agrupación y conteo.

☐ Orden descendente.

☐ SQL parametrizado con $queryRaw.

☐ Corte diario.

☐ Validación YYYY-MM-DD.

☐ Filtro por scheduledAt.

☐ Solo COMPLETADA y CANCELADA.

☐ groupBy por status.

☐ Protección GERENCIA.

☐ Swagger actualizado.

☐ Bearer Auth en Swagger.

☐ Sin any.

☐ Tipos de Prisma utilizados.

☐ Flujo integral probado.

☐ PR por cada etapa.

☐ Revisión y merge.

☐ PR final aprobado y mergeado.

## 16.6 Reto extra — verificar por separado

☐ Relación opcional User–Doctor.

☐ Médico vinculado con usuario.

☐ Médico no consulta agenda ajena.

☐ Médico no actualiza citas ajenas.

☐ 403 cuando intenta acceder a recursos ajenos.

# 17. Dictamen final y uso como línea base

Este documento consolida los requisitos identificables en el enunciado semanal disponible y separa:

Funcionalidades obligatorias.

Comportamientos de ejemplo técnico.

Recomendaciones de diseño.

Desafío extra.

Ambigüedades y aspectos no especificados.

Pruebas.

Entregables diarios.

Flujo Git y Pull Requests.

No debe utilizarse para justificar funcionalidades que el ejercicio no solicita. Tampoco sustituye la necesidad de consultar cualquier material original adicional que FUNVAL haya entregado por separado.

Criterio rector: una implementación se evalúa contra el comportamiento que FUNVAL documentó; las ampliaciones del equipo se identifican por separado y no se confunden con obligaciones del ejercicio.

Estado de esta línea base: completa respecto del enunciado semanal disponible; pendiente de cotejo con cualquier rúbrica, material diario o recurso original independiente que todavía no se haya proporcionado.

18. Actualización v2.1 — precisiones documentales

Propósito de esta actualización. Incorporar precisiones identificadas al cotejar el Documento Maestro v2.0 con el archivo original “Backend Persistente con Prisma — Clínica Salud Integral”. Esta actualización conserva la línea base anterior y no agrega funcionalidades de negocio nuevas ni convierte recomendaciones o ejemplos técnicos en obligaciones.

Regla de interpretación. Las precisiones siguientes deben leerse junto con las clasificaciones de la sección 1. Cuando un punto sea una recomendación, ejemplo técnico o instrucción de implementación, se mantiene expresamente esa naturaleza.

18.1 Precisiones incorporadas

PREC-01 — Diagrama de relaciones en dbdiagram.io

CLASIFICACIÓN: RECOMENDACIÓN. El material del lunes sugiere dibujar el modelo relacional en dbdiagram.io para visualizar las relaciones antes de escribir schema.prisma. No es obligatorio. La ausencia del diagrama no constituye por sí sola incumplimiento del entregable.

PREC-02 — Integración del kit de autenticación

CLASIFICACIÓN: EXPLÍCITO. El miércoles FUNVAL proporciona un kit de middlewares y controladores de autenticación ya construido. La tarea consiste en integrarlo a la arquitectura MVC del proyecto. No se exige reescribir desde cero el mecanismo JWT ni el hashing de contraseñas. La implementación debe conservar el comportamiento solicitado y adaptarse a los nombres y rutas reales del proyecto.

PREC-03 — Ruta de documentación Swagger

CLASIFICACIÓN: EJEMPLO TÉCNICO / ENTREGABLE DE DOCUMENTACIÓN. El material identifica Swagger UI en /api/docs. La documentación debe permitir probar los endpoints y debe incluir el esquema Bearer Auth para enviar el token a las rutas protegidas. La organización interna puede variar mientras se conserve esa capacidad.

PREC-04 — Tipos generados por Prisma

CLASIFICACIÓN: EXPLÍCITO. Para los datos procedentes de Prisma deben utilizarse los tipos generados por Prisma Client, en lugar de crear interfaces manuales innecesarias. El ejemplo del ejercicio importa los tipos desde la carpeta generated/prisma configurada en el proyecto. La ruta concreta de importación dependerá de la ubicación del archivo.

PREC-05 — Parametrización segura de SQL dinámico

CLASIFICACIÓN: EXPLÍCITO. El reporte por especialidad utiliza prisma.$queryRaw con tagged templates. Si se agregan valores dinámicos —por ejemplo, filtros de fechas— deben interpolarse como parámetros del template. No se debe concatenar manualmente una cadena SQL con valores externos.

PREC-06 — Comandos de inicialización y configuración con pnpm

CLASIFICACIÓN: EJEMPLO TÉCNICO. El material muestra pnpm para inicializar el proyecto, instalar dependencias y ejecutar Prisma. Entre los comandos de referencia se encuentran la instalación de prisma, @prisma/client, @prisma/adapter-pg, pg y dotenv; la instalación de @types/pg como dependencia de desarrollo; prisma init con la ruta de salida indicada; y prisma migrate dev. Los comandos exactos deben corresponder a la versión 7 y al flujo descrito por FUNVAL, sin sustituirlos por instrucciones de otras versiones.

18.2 Ajustes a la lista maestra de verificación

☐ El equipo revisó si necesita elaborar el diagrama relacional sugerido en dbdiagram.io; se reconoce que es recomendable, no obligatorio.

☐ El kit de autenticación proporcionado por FUNVAL fue integrado a la arquitectura MVC.

☐ Swagger UI está disponible en /api/docs.

☐ Swagger incluye Bearer Auth y permite probar rutas protegidas con token.

☐ Los tipos de los modelos de Prisma se importan desde el cliente generado en generated/prisma, según corresponda.

☐ Las consultas SQL con valores dinámicos utilizan parámetros mediante tagged templates de $queryRaw; no concatenan entradas en SQL.

☐ La configuración y los comandos Prisma corresponden al flujo de Prisma 7 descrito por FUNVAL.

18.3 Ubicación de estas precisiones dentro del documento

PREC-01 → Secciones 4 y 9: modelado y relaciones.

PREC-02 → Secciones 10 y 12.3: autenticación e integración del kit del miércoles.

PREC-03 → Secciones 9, 10, 11 y 12.5: documentación y entrega.

PREC-04 → Secciones 9, 11 y 12.5: tipado y uso de Prisma Client generado.

PREC-05 → Secciones 8, 9 y 11: reporte por especialidad y seguridad de consulta.

PREC-06 → Secciones 9 y 12.1: configuración técnica de Prisma 7.

18.4 Dictamen de actualización

Resultado del cotejo: La versión 2.1 conserva la cobertura funcional y técnica identificada en la versión 2.0 y añade precisiones para facilitar la implementación y la auditoría. No se identificó en el documento original proporcionado un módulo obligatorio adicional omitido por la versión 2.0. Esta conclusión se limita al archivo original de 10 páginas entregado para la comparación; no sustituye una rúbrica independiente ni materiales adicionales de FUNVAL que no hayan sido proporcionados.

Criterio rector: La versión 2.1 es la línea base documental actualizada para la auditoría del proyecto. Los requisitos obligatorios, ejemplos técnicos, recomendaciones, desafío extra y aspectos no especificados mantienen su clasificación original.
