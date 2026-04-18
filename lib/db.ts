// lib/db.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import * as schema from './schema'; // 🔥 IMPORTANTE: Importamos tu esquema

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en las variables de entorno');
}

if (!process.env.DATABASE_AUTH_TOKEN) {
  throw new Error('Falta DATABASE_AUTH_TOKEN en las variables de entorno');
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// 🔥 LA CLAVE: Pasamos el 'schema' como segundo argumento
// He quitado el fetch-cache global para que el Panel de Control sea instantáneo
export const db = drizzle(client, { schema });