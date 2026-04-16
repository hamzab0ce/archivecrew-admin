// lib/db.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en las variables de entorno');
}

if (!process.env.DATABASE_AUTH_TOKEN) {
  throw new Error('Falta DATABASE_AUTH_TOKEN en las variables de entorno');
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
  // 🔥 ESCUDO ACTIVADO: Next.js guardará el resultado 1 hora (3600 segundos)
  fetch: (url: RequestInfo | URL, options?: RequestInit) => {
    return fetch(url, {
      ...options,
      next: { revalidate: 43200 } 
    });
  }
});

export const db = drizzle(client);