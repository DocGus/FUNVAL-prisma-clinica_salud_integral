
import cors from "cors";
import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/authRoutes.js";
import doctorsRoutes from "./routes/doctorsRoutes.js";
import patientsRoutes from "./routes/patientsRoutes.js";

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
                "startAt",
                "status",
                "doctor",
              ],
              properties: {
                id: { type: "string", format: "uuid" },
                patientId: { type: "string", format: "uuid" },
                doctorId: { type: "string", format: "uuid" },
                startAt: { type: "string", format: "date-time" },
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
    "/api/patients": {
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
          "Requiere autenticación y rol RECEPCIONISTA o GERENCIA. Sin resultados devuelve una lista vacía.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "specialtyId",
            in: "query",
            required: false,
            description: "Filtra los médicos por UUID de especialidad.",
            schema: { type: "string", format: "uuid" },
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
            description: "El filtro specialtyId no es un UUID válido.",
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
  },
};

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/patients", patientsRoutes);

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
