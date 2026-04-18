import { db } from '@/lib/db'
import { games } from '@/lib/schema'
import EditorClient from './editor-client'
import { or, like, asc } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { decodeJwt } from 'jose'

export const dynamic = 'force-dynamic';

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ letra?: string }> }) {
  const params = await searchParams;
  const letraUrl = params?.letra || "A";

  // 1. LEER EL PASE VIP
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  let isAdmin = false;
  
  if (token) {
    try {
      const decoded = decodeJwt(token);
      isAdmin = decoded.role === "admin";
    } catch (e) {}
  }

  // 2. CONDICIÓN DE BÚSQUEDA
  let whereCondition;
  if (letraUrl === "#") {
    whereCondition = or(...[0,1,2,3,4,5,6,7,8,9].map(num => like(games.title, `${num}%`)));
  } else {
    whereCondition = like(games.title, `${letraUrl}%`);
  }

  // 🚀 3. LA SOLUCIÓN REAL: API Relacional de Drizzle
  // Esto hace que Turso lo procese TODO en Cero-Coma usando agregación JSON interna.
  // 1 sola petición, 0 cruces manuales en JavaScript.
  const enrichedGames = await db.query.games.findMany({
    where: whereCondition,
    orderBy: [asc(games.title)],
    with: {
      linksDescarga: true,
      gamesGenres: true,
    },
  });

  return <EditorClient initialGames={enrichedGames} letraActual={letraUrl} isAdmin={isAdmin} />
}