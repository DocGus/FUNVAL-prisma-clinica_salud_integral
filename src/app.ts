
import cors from "cors";
import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import patientsRoutes from "./routes/patientsRoutes.js";

const apiDocument = {
  openapi: "3.0.3",
  info: {
    title: "FUNVAL API",
    version: "1.0.0",
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
  },
};

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/patients", patientsRoutes);

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(apiDocument));
