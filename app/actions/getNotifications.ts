import { db } from "@/lib/db";
import { games, news } from "@/lib/schema";
import { desc } from "drizzle-orm";
// 🔥 Importamos la lavadora de enlaces
import { cleanSlug } from "@/lib/slugify";

export async function getMixedNotifications() {
  // 1. Traemos los últimos 20 juegos
  const gamesList = await db.select({ id: games.id, title: games.title, createdAt: games.createdAt, slug: games.slug }).from(games).orderBy(desc(games.createdAt)).limit(20);

  // 2. Traemos las últimas 20 noticias
  const newsRecords = await db.select({ id: news.id, title: news.title, content: news.content, createdAt: news.createdAt, type: news.type }).from(news).orderBy(desc(news.createdAt)).limit(20);

  // 3. Mezclamos y formateamos
  const mixed = [
    ...gamesList.map((g: any) => {
      // 🔥 LÓGICA DE SLUG BLINDADA:
      let slug = cleanSlug(g.slug || g.title || "juego");
      if (!slug.endsWith('-descargar-gratis')) {
        slug += '-descargar-gratis';
      }

      return {
        id: `game-${g.id}`,
        title: `Nuevo juego: ${g.title}`,
        description: "¡Ya disponible en el catálogo para descargar!",
        date: g.createdAt,
        type: "game",
        url: `/game/${slug}/${g.id}`
      };
    }),
    ...newsRecords.map((n: any) => ({
      id: `news-${n.id}`,
      title: n.title,
      description: n.content,
      date: n.createdAt,
      type: n.type,
      url: "#"
    }))
  ];

  // 4. Ordenamos por fecha
  return mixed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}