
import cors from "cors";
import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import appointmentsRoutes from "./routes/appointmentsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import doctorsRoutes from "./routes/doctorsRoutes.js";
import patientsRoutes from "./routes/patientsRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import specialtiesRoutes from "./routes/specialtiesRoutes.js";

const apiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Clínica Salud Integral API",
    version: "1.0.0",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
          errors: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 },
        },
        additionalProperties: false,
      },
      LoginResponse: {
        type: "object",
        required: ["token", "user"],
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            required: ["id", "email", "role", "doctorId"],
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string", format: "email" },
              role: {
                type: "string",
                enum: ["RECEPCIONISTA", "MEDICO", "GERENCIA"],
              },
              doctorId: {
                type: "string",
                format: "uuid",
                nullable: true,
              },
            },
          },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "role"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          role: {
            type: "string",
            enum: ["RECEPCIONISTA", "MEDICO", "GERENCIA"],
          },
          doctorId: {
            type: "string",
            format: "uuid",
            nullable: true,
          },
        },
        additionalProperties: false,
      },
      UserPublicData: {
        type: "object",
        required: ["id", "email", "role", "doctorId"],
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          role: {
            type: "string",
            enum: ["RECEPCIONISTA", "MEDICO", "GERENCIA"],
          },
          doctorId: {
            type: "string",
            format: "uuid",
            nullable: true,
          },
        },
      },
      AppointmentCreateRequest: {
        type: "object",
        required: ["patientId", "doctorId", "scheduledAt"],
        properties: {
          patientId: { type: "string", format: "uuid" },
          doctorId: { type: "string", format: "uuid" },
          scheduledAt: { type: "string", format: "date-time" },
          reason: { type: "string", maxLength: 500, nullable: true },
        },
        additionalProperties: false,
      },
      AppointmentStatusUpdateRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["COMPLETADA", "CANCELADA"],
          },
        },
        additionalProperties: false,
      },
      AppointmentWithPatient: {
        type: "object",
        required: ["id", "patientId", "doctorId", "scheduledAt", "status", "patient"],
        properties: {
          id: { type: "string", format: "uuid" },
          patientId: { type: "string", format: "uuid" },
          doctorId: { type: "string", format: "uuid" },
          scheduledAt: { type: "string", format: "date-time" },
          reason: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["PROGRAMADA", "COMPLETADA", "CANCELADA"],
          },
          patient: {
            type: "object",
            required: ["id", "firstName", "lastName", "email"],
            properties: {
              id: { type: "string", format: "uuid" },
              firstName: { type: "string" },
              lastName: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
        },
      },
      PatientCreateRequest: {
        type: "object",
        required: ["firstName", "lastName", "email", "birthDate"],
        properties: {
          firstName: { type: "string", minLength: 1 },
          lastName: { type: "string", minLength: 1 },
          email: { type: "string", format: "email" },
          birthDate: { type: "string", format: "date" },
          phone: { type: "string" },
        },
        additionalProperties: false,
      },
      SpecialtySummary: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
        },
      },
      Specialty: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
        },
      },
      DoctorDirectoryEntry: {
        type: "object",
        required: [
          "id",
          "firstName",
          "lastName",
          "professionalLicense",
          "email",
          "specialty",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          professionalLicense: { type: "string" },
          email: { type: "string", format: "email", nullable: true },
          specialty: { $ref: "#/components/schemas/SpecialtySummary" },
        },
      },
      PatientData: {
        type: "object",
        required: ["id", "firstName", "lastName", "email", "birthDate", "phone"],
        properties: {
          id: { type: "string", format: "uuid" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          birthDate: { type: "string", format: "date-time" },
          phone: { type: "string", nullable: true },
        },
      },
      PatientRecord: {
        type: "object",
        required: [
          "id",
          "firstName",
          "lastName",
          "email",
          "birthDate",
          "phone",
          "appointments",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          birthDate: { type: "string", format: "date-time" },
          phone: { type: "string", nullable: true },
          appointments: {
            type: "array",
            items: {
              type: "object",
              required: [
                "id",
                "patientId",
                "doctorId",
                "scheduledAt",
                "status",
                "doctor",
              ],
              properties: {
                id: { type: "string", format: "uuid" },
                patientId: { type: "string", format: "uuid" },
                doctorId: { type: "string", format: "uuid" },
                scheduledAt: { type: "string", format: "date-time" },
                reason: { type: "string", nullable: true },
                status: {
                  type: "string",
                  enum: ["PROGRAMADA", "COMPLETADA", "CANCELADA"],
                },
                doctor: {
                  $ref: "#/components/schemas/DoctorDirectoryEntry",
                },
              },
            },
          },
        },
      },
      SpecialtyAppointmentVolume: {
        type: "object",
        required: ["specialtyId", "specialty", "totalAppointments"],
        properties: {
          specialtyId: { type: "string", format: "uuid" },
          specialty: { type: "string" },
          totalAppointments: { type: "integer", minimum: 0 },
        },
      },
      DailyCutoffReport: {
        type: "object",
        required: ["date", "completed", "cancelled", "total"],
        properties: {
          date: { type: "string", format: "date" },
          completed: { type: "integer", minimum: 0 },
          cancelled: { type: "integer", minimum: 0 },
          total: { type: "integer", minimum: 0 },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Check API health",
        responses: {
          "200": {
            description: "The API is ready.",
          },
        },
      },
    },
    "/api/auth": {
      post: {
        tags: ["Autenticación"],
        summary: "Iniciar sesión",
        description: "Autentica una cuenta existente. No requiere token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Inicio de sesión correcto.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "400": {
            description: "Correo o contraseña con formato inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Credenciales inválidas.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al iniciar sesión.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Autenticación"],
        summary: "Registrar usuario",
        description: "Requiere autenticación válida y rol GERENCIA.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuario creado correctamente.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["message", "data"],
                  properties: {
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/UserPublicData" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Datos del usuario inválidos.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token ausente o inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "La cuenta no tiene permisos para registrar usuarios.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Ya existe un usuario con ese correo electrónico.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al registrar usuario.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/patients": {
      get: {
        tags: ["Pacientes"],
        summary: "Listar pacientes",
        description: "Requiere autenticación y rol RECEPCIONISTA.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Listado de pacientes.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/PatientData" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente o inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "El rol no tiene permiso para consultar pacientes.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al consultar pacientes.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Pacientes"],
        summary: "Registrar paciente",
        description: "Requiere autenticación y rol RECEPCIONISTA.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PatientCreateRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Paciente registrado correctamente.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["message", "data"],
                  properties: {
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/PatientData" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Datos del paciente inválidos.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token ausente o inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "El rol no tiene permiso para registrar pacientes.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Ya existe un paciente con ese correo electrónico.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al registrar el paciente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/patients/{id}": {
      get: {
        tags: ["Pacientes"],
        summary: "Consultar expediente de paciente",
        description:
          "Requiere autenticación y rol RECEPCIONISTA. Incluye datos personales y todas las citas relacionadas, con datos del médico y su especialidad.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "UUID del paciente.",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Expediente del paciente.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/PatientRecord" },
                  },
                },
              },
            },
          },
          "400": {
            description: "El ID del paciente no es un UUID válido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token ausente o inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "El rol no tiene permiso para consultar expedientes.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Paciente no encontrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al consultar el paciente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/doctors": {
      get: {
        tags: ["Médicos"],
        summary: "Consultar directorio de médicos",
        description:
          "Requiere autenticación y exclusivamente el rol RECEPCIONISTA. Sin resultados devuelve una lista vacía.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "specialty",
            in: "query",
            required: false,
            description:
              "Filtra los médicos por nombre de especialidad. La comparación es exacta e insensible a mayúsculas y minúsculas.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Directorio de médicos, posiblemente vacío.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/DoctorDirectoryEntry",
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "El filtro specialty debe ser un nombre de especialidad válido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token ausente o inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "El rol no tiene permiso para consultar el directorio.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al consultar médicos.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/doctors/{id}/appointments": {
      get: {
        tags: ["Agenda médica"],
        summary: "Consultar agenda de un médico",
        description:
          "Requiere autenticación y rol MEDICO. Puede filtrarse por rango de fechas opcional con from y to.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "UUID del médico.",
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "from",
            in: "query",
            required: false,
            description: "Fecha inicial inclusiva del rango.",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "to",
            in: "query",
            required: false,
            description: "Fecha final inclusiva del rango.",
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          "200": {
            description: "Agenda del médico, posiblemente vacía.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/AppointmentWithPatient" },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "El UUID del médico o los filtros están mal formados.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token ausente o inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "El rol no tiene permiso para consultar agenda.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Médico no encontrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al consultar la agenda.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/appointments": {
      post: {
        tags: ["Citas"],
        summary: "Programar cita",
        description: "Requiere autenticación y rol RECEPCIONISTA.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AppointmentCreateRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Cita creada correctamente.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["message", "data"],
                  properties: {
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/AppointmentWithPatient" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Datos de la cita inválidos o fecha pasada.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token ausente o inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "El rol no tiene permiso para programar citas.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Paciente o médico no encontrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al registrar la cita.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/appointments/{id}/status": {
      patch: {
        tags: ["Citas"],
        summary: "Actualizar estado de la cita",
        description: "Requiere autenticación y rol MEDICO.",
        security: [{ bearerAuth: [] }],
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          description: "UUID de la cita.",
          schema: { type: "string", format: "uuid" },
        }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AppointmentStatusUpdateRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Estado actualizado correctamente.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["message", "data"],
                  properties: {
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/AppointmentWithPatient" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Estado inválido o UUID incorrecto.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token ausente o inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "El rol no tiene permiso para actualizar el estado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Cita no encontrada.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al actualizar la cita.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/reports/appointments-by-specialty": {
      get: {
        tags: ["Reportes"],
        summary: "Volumen de citas por especialidad",
        description: "Requiere autenticación válida y rol GERENCIA. Devuelve el total de citas agrupadas por especialidad, incluyendo especialidades sin citas.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Reporte de volumen de citas por especialidad.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SpecialtyAppointmentVolume" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente o inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "El usuario no tiene permisos para consultar reportes gerenciales.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al consultar el reporte por especialidad.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/reports/daily-cutoff": {
      get: {
        tags: ["Reportes"],
        summary: "Corte diario de citas completadas y canceladas",
        description: "Requiere autenticación válida y rol GERENCIA. Calcula el total de citas completadas y canceladas para la fecha indicada en la zona horaria de negocio America/Mexico_City.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "date",
            in: "query",
            required: true,
            description: "Fecha en formato YYYY-MM-DD.",
            schema: { type: "string", format: "date" },
          },
        ],
        responses: {
          "200": {
            description: "Corte diario del día solicitado.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/DailyCutoffReport" },
                  },
                },
              },
            },
          },
          "400": {
            description: "La fecha es obligatoria o tiene un formato inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token ausente o inválido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "El usuario no tiene permisos para consultar cortes diarios.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Error interno al consultar el corte diario.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/specialties": {
      get: {
        tags: ["Especialidades"],
        summary: "Consultar catálogo de especialidades",
        description: "Consulta pública y de solo lectura.",
        responses: {
          "200": {
            description: "Lista de especialidades; puede estar vacía.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Specialty" },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Error interno al consultar especialidades.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/specialties", specialtiesRoutes);

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(apiDocument, {
    swaggerOptions: {
      persistAuthorization: false,
    },
  }),
);
