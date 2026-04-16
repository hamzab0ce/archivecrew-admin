'use server';

import { db } from "@/lib/db"
import { games, gamesGenres } from "@/lib/schema"
import { eq, inArray, ne } from "drizzle-orm"
import { unstable_cache } from "next/cache"

export async function getSimilarGames(gameId: number) {
  
  const fetchCachedSimilar = unstable_cache(
    async () => {
      try {
        // 1. Obtener géneros del juego actual
        const gameGenreList = await db.select({ genre: gamesGenres.genre }).from(gamesGenres).where(eq(gamesGenres.game_id, gameId));

        if (!gameGenreList || gameGenreList.length === 0) return [];

        const genreNames = gameGenreList
          .map((g: any) => g.genre)
          .filter((genre: any): genre is string => genre !== null);

        // 2. Buscar juegos que compartan géneros
        const similarGames = await db.select({ id: games.id, title: games.title, cover_url: games.cover_url }).from(games).innerJoin(gamesGenres, eq(games.id, gamesGenres.game_id)).where(
          inArray(gamesGenres.genre, genreNames)
        ).limit(12);

        // Eliminar duplicados y filtrar el juego actual
        const uniqueSimilar = Array.from(new Map(similarGames.map(g => [g.id, g])).values())
          .filter(g => g.id !== gameId)
          .map(g => ({ id: g.id, title: g.title, cover_url: g.cover_url }));

        return uniqueSimilar.sort(() => 0.5 - Math.random()).slice(0, 6);
      } catch (error) {
        console.error("Error obteniendo juegos similares:", error);
        return [];
      }
    },
    ["similar-games", String(gameId)], // 🔑 La llave depende del ID del juego
    { revalidate: 86400, tags: ["similar-games"] }
  );

  return fetchCachedSimilar();
}