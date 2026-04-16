'use server';

import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getMostVisitedGames = unstable_cache(
  async () => {
    return await db.select().from(games).orderBy(desc(games.views)).limit(5);
  },
  ["most-visited-games"], // 🔑 Llave fija
  { revalidate: 21600, tags: ["trending"] }
);