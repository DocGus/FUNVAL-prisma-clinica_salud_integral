import "dotenv/config";
import { environmentSchema } from "./env.schema.js";

export const env = environmentSchema.parse(process.env);
