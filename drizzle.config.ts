import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Cargamos las variables de tu archivo .env
dotenv.config();

export default defineConfig({
  schema: "./lib/schema.ts", // (Asegúrate de que la ruta es correcta)
  out: "./drizzle",
  dialect: "turso", // ¡Turso ahora es su propio dialecto!
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
});