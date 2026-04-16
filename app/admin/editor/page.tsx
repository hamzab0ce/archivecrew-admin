import { db } from '@/lib/db'
import { games, linksDescarga, gamesGenres } from '@/lib/schema'
import EditorClient from './editor-client'
import { or, like, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic';

export default async function EditorPage({ searchParams }: { searchParams: { letra?: string } }) {
  // Extrae la letra de searchParams, por defecto "A"
  const letraUrl = searchParams?.letra || "A";

  let whereCondition;
  if (letraUrl === "#") {
    // Buscar juegos que comiencen con numeros
    whereCondition = or(...[0,1,2,3,4,5,6,7,8,9].map(num => like(games.title, `${num}%`)));
  } else {
    whereCondition = like(games.title, `${letraUrl}%`);
  }

  // 🔥 Traer juegos DIRECTAMENTE de la base de datos sin cachés raras
  const gamesList = await db.select({
    id: games.id,
    title: games.title,
    cover_url: games.cover_url,
    captura: games.captura,
    content: games.content,        
    platform: games.platform,
    requeriments: games.requeriments,
    reqMinimos: games.reqMinimos,
    fileSize: games.fileSize,
    version: games.version,
    creditSource: games.creditSource,
    password: games.password,
    instructions: games.instructions,
  }).from(games).where(whereCondition).orderBy(games.title);

  // Enriquecer cada juego con sus links y géneros
  const enrichedGames = await Promise.all(
    gamesList.map(async (game) => {
      const links = await db.select().from(linksDescarga).where(eq(linksDescarga.juego_id, game.id));
      const genres = await db.select().from(gamesGenres).where(eq(gamesGenres.game_id, game.id));
      
      return {
        ...game,
        links_descarga: links,
        games_genres: genres
      };
    })
  );

  return <EditorClient initialGames={enrichedGames} letraActual={letraUrl} />
}