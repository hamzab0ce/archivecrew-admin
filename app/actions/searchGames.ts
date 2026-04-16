//'use server'

import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { like } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export async function searchGames(query: string) {
  if (!query || query.length < 2) return [];

  const fetchCachedSearch = unstable_cache(
    async () => {
      try {
        return await db.select({ 
          id: games.id, 
          title: games.title, 
          cover_url: games.cover_url, 
          captura: games.captura, 
          slug: games.slug, 
          platform: games.platform 
        }).from(games).where(like(games.title, `%${query}%`)).limit(50);
      } catch (error) {
        console.error("Error searching games:", error);
        return [];
      }
    },
    ["search-games", query.toLowerCase()], // 🔑 La llave es la palabra exacta que han buscado
    { revalidate: 3600, tags: ["search"] }
  );

  return fetchCachedSearch();
}