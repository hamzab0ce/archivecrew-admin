import { db } from '@/lib/db'
import { games } from '@/lib/schema'
import EditorClient from './editor-client'
import { or, like } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic';

// 🔥 CACHEAR las busquedas del editor por letra
const getCachedEditorGames = unstable_cache(
  async (letraUrl: string) => {
    let whereCondition;
    if (letraUrl === "#") {
      // Buscar juegos que comiencen con numeros
      whereCondition = or(...[0,1,2,3,4,5,6,7,8,9].map(num => like(games.title, `${num}%`)));
    } else {
      whereCondition = like(games.title, `${letraUrl}%`);
    }

    let query = db.select({
      id: games.id,
      title: games.title,
      cover_url: games.cover_url,
      captura: games.captura,
      content: games.content,        
      platform: games.platform,
      requeriments: games.requeriments,
      fileSize: games.fileSize,
      version: games.version,
      creditSource: games.creditSource,
      password: games.password,
      instructions: games.instructions,
    }).from(games).where(whereCondition);

    return await query.orderBy(games.title);
  },
  ["editor-games"],
  { revalidate: 3600, tags: ["editor-games"] }
);

export default async function EditorPage() {
  // Por defecto mostramos la letra "A"
  const letraUrl = "A";

  // 🔥 OPTIMIZADO: Ahora con cache dinamico por letra
  const gamesList = await getCachedEditorGames(letraUrl);

  return <EditorClient initialGames={gamesList} letraActual={letraUrl} />
}