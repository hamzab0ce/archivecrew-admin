//"use server";

import { ITEMS_PER_PAGE } from "@/const/itemPerPage";
import { db } from "@/lib/db";
import { games, gamesGenres, linksDescarga } from "@/lib/schema";
import { unstable_cache } from "next/cache";
import { eq, like, inArray, notInArray, count, and, desc, asc } from "drizzle-orm";

type GetGamesParams = {
  page?: number;
  category?: string; 
  platform?: string; 
  genre?: string;    
  letter?: string;   
  sort?: string;     
};

const MAIN_GENRES = [
  "Acción", "Indie", "Aventura", "Simulación", "Rol (RPG)", 
  "Estrategia", "Casual", "Shooter", "Carreras", "Deportes", 
  "Plataformas", "Puzles", "Arcade", "Lucha"
];

const mapCategoryToDB = (urlCategory?: string) => {
  if (urlCategory === "bajos-requisitos") return "Bajos";
  if (urlCategory === "medios-requisitos") return "Medios";
  if (urlCategory === "altos-requisitos") return "Altos";
  return urlCategory;
};

const buildWhereConditions = (category?: string, platform?: string, letter?: string) => {
  const conditions = [];
  const dbCategory = mapCategoryToDB(category);
  if (dbCategory) {
    // 🔥 OPTIMIZADO: like sin % al inicio para que SQLite use el indice en requeriments
    conditions.push(like(games.requeriments, `${dbCategory}%`));
  }
  if (platform) {
    conditions.push(eq(games.platform, platform));
  }
  if (letter) {
    conditions.push(like(games.title, `${letter}%`));
  }
  return conditions;
};

export async function getGames(params: GetGamesParams) {
  const { page = 1, category, platform, genre, letter, sort } = params;

  const cacheKey = [
    "games-list",
    String(page),
    category || "all",
    platform || "all",
    genre || "all",
    letter || "all",
    sort || "default"
  ];

  const fetchCachedGames = unstable_cache(
    async () => {
      const conditions = buildWhereConditions(category, platform, letter);

      if (genre) {
        const genreCondition = genre === "Otros"
          ? notInArray(gamesGenres.genre, MAIN_GENRES)
          : eq(gamesGenres.genre, genre);

        conditions.push(
          inArray(
            games.id,
            db.select({ game_id: gamesGenres.game_id }).from(gamesGenres).where(genreCondition)
          )
        );
      }

      const finalWhere = conditions.length > 0 ? and(...conditions) : undefined;
      const isFiltering = !!category || !!genre || !!letter || !!sort;
      const shouldRandomize = page === 1 && !isFiltering;

      // ============================================
      // MODO ALEATORIO (Optimizado)
      // ============================================
      if (shouldRandomize) {
        const allIdsResult = await db.select({ id: games.id }).from(games).where(finalWhere).orderBy(desc(games.id)).limit(200);
        
        const shuffled = allIdsResult.sort(() => 0.5 - Math.random());
        const selectedIds = shuffled.slice(0, ITEMS_PER_PAGE).map((item) => item.id);

        if (selectedIds.length === 0) return { games: [], totalGames: 0 };

        const randomGames = await db.select().from(games).where(inArray(games.id, selectedIds));

        // BATCH FETCH: Traemos todo de golpe para estos IDs
        const [allLinks, allGenres] = await Promise.all([
          db.select().from(linksDescarga).where(inArray(linksDescarga.juego_id, selectedIds)),
          db.select().from(gamesGenres).where(inArray(gamesGenres.game_id, selectedIds))
        ]);

        const gamesWithLinks = randomGames.map(game => ({
          ...game,
          links_descarga: allLinks.filter(l => l.juego_id === game.id),
          games_genres: allGenres.filter(g => g.game_id === game.id)
        })).sort(() => 0.5 - Math.random());

        const countResult = await db.select({ count: count() }).from(games).where(finalWhere);
        
        return {
          games: gamesWithLinks,
          totalGames: Number(countResult[0]?.count) || 0,
        };
      }

      // ============================================
      // MODO NORMAL (Optimizado)
      // ============================================
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const orderByClause = sort === 'az' ? asc(games.title) : desc(games.createdAt);

      const gamesResult = await db.select().from(games).where(finalWhere).orderBy(orderByClause).offset(skip).limit(ITEMS_PER_PAGE);

      if (gamesResult.length === 0) return { games: [], totalGames: 0 };

      const gameIds = gamesResult.map(g => g.id);

      // BATCH FETCH: Solo 2 consultas para todos los hijos
      const [allLinks, allGenres] = await Promise.all([
        db.select().from(linksDescarga).where(inArray(linksDescarga.juego_id, gameIds)),
        db.select().from(gamesGenres).where(inArray(gamesGenres.game_id, gameIds))
      ]);

      const gamesWithLinks = gamesResult.map(game => ({
        ...game,
        links_descarga: allLinks.filter(l => l.juego_id === game.id),
        games_genres: allGenres.filter(g => g.game_id === game.id)
      }));

      const countResult = await db.select({ count: count() }).from(games).where(finalWhere);

      return {
        games: gamesWithLinks,
        totalGames: Number(countResult[0]?.count) || 0,
      };
    },
    cacheKey,
    { 
      revalidate: 21600,
      tags: ["games-list"] 
    }
  );

  return fetchCachedGames();
}

export type GamesWithLinks = any;