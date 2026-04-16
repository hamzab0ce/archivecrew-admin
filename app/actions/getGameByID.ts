//"use server"

import { db } from "@/lib/db";
import { games, linksDescarga, gamesGenres } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export async function getGameByID(id: number) {
  
  // 1. Fabricamos la llave exacta para la taquilla de ESTE juego
  const cacheKey = ["get-game-by-id", String(id)];

  // 2. Envolvemos la búsqueda en la caja fuerte
  const fetchCachedGame = unstable_cache(
    async () => {
      // Esto solo despierta a Neon la PRIMERA vez que alguien entra a ESTE juego concreto
      const [gameData] = await db.select().from(games).where(eq(games.id, id));
      
      if (!gameData) return null;

      // Traemos relaciones
      const links = await db.select().from(linksDescarga).where(eq(linksDescarga.juego_id, id));
      const genres = await db.select().from(gamesGenres).where(eq(gamesGenres.game_id, id));

      return {
        ...gameData,
        links_descarga: links,
        games_genres: genres
      };
    },
    cacheKey, // 🔑 Usamos la llave que tiene el número del ID
    { 
      revalidate: 86400, 
      tags: ["game-detail", `game-${id}`] // Le ponemos una etiqueta única por si un día quieres actualizar solo este juego
    }
  );

  // 3. Devolvemos el juego de la taquilla
  return fetchCachedGame();
}