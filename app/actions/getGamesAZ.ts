'use server';

import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getGamesAZ = unstable_cache(
  async () => {
    try {
      return await db.select({ id: games.id, title: games.title, slug: games.slug }).from(games).orderBy(asc(games.title));
    } catch (error) {
      console.error("Error cargando la lista A-Z:", error);
      return [];
    }
  },
  ["games-az-list"], // 🔑 Llave fija porque siempre es la misma lista
  { revalidate: 21600, tags: ["games-list"] }
);