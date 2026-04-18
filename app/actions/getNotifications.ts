import { db } from "@/lib/db";
import { games, news } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
// 🔥 Importamos la lavadora de enlaces
import { cleanSlug } from "@/lib/slugify";

export async function getMixedNotifications() {
  // 1. Traemos los 20 juegos MÁS NUEVOS (Recién subidos)
  const newGames = await db.select({ 
    id: games.id, 
    title: games.title, 
    createdAt: games.createdAt, 
    slug: games.slug 
  })
  .from(games)
  .where(eq(games.status, 'approved'))
  .orderBy(desc(games.createdAt))
  .limit(20);

  // 2. Traemos los 20 juegos MÁS ACTUALIZADOS (Para detectar modificaciones)
  const updatedGames = await db.select({ 
    id: games.id, 
    title: games.title, 
    createdAt: games.createdAt,
    updatedAt: games.updatedAt, 
    slug: games.slug 
  })
  .from(games)
  .where(eq(games.status, 'approved'))
  .orderBy(desc(games.updatedAt))
  .limit(20);

  // 3. Traemos las noticias de sistema (Tabla News)
  const newsRecords = await db.select({ 
    id: news.id, 
    title: news.title, 
    content: news.content, 
    createdAt: news.createdAt, 
    type: news.type 
  })
  .from(news)
  .orderBy(desc(news.createdAt))
  .limit(20);

  // 4. CREAMOS LA LISTA DE EVENTOS (Mezclamos todo)
  let mixed: any[] = [];

  // A. Eventos de Juegos NUEVOS
  newGames.forEach((g) => {
    let slug = cleanSlug(g.slug || g.title || "juego");
    if (!slug.endsWith('-descargar-gratis')) slug += '-descargar-gratis';

    mixed.push({
      id: `game-new-${g.id}`,
      title: `Nuevo juego: ${g.title}`,
      description: "¡Ya disponible en el catálogo para descargar!",
      date: g.createdAt,
      type: "game", // <--- Tu frontend usará esto para poner el icono del mando
      url: `/game/${slug}/${g.id}`
    });
  });

  // B. Eventos de Juegos ACTUALIZADOS
  updatedGames.forEach((g) => {
    // 🔥 TRUCO: Solo lo marcamos como "Actualizado" si la fecha de actualización 
    // es por lo menos 1 minuto mayor a la de creación (para evitar duplicados al subir por primera vez)
    const createdTime = new Date(g.createdAt).getTime();
    const updatedTime = new Date(g.updatedAt).getTime();
    
    if (updatedTime - createdTime > 60000) { 
      let slug = cleanSlug(g.slug || g.title || "juego");
      if (!slug.endsWith('-descargar-gratis')) slug += '-descargar-gratis';

      mixed.push({
        id: `game-upd-${g.id}`,
        title: `Juego actualizado: ${g.title}`,
        description: "¡Se han actualizado los enlaces o detalles de este juego!",
        date: g.updatedAt, // <--- Usamos la fecha de la actualización
        type: "update", // <--- Puedes usar "update" en tu frontend para poner un icono de unas flechas 🔄
        url: `/game/${slug}/${g.id}`
      });
    }
  });

  // C. Eventos de Noticias
  newsRecords.forEach((n) => {
    mixed.push({
      id: `news-${n.id}`,
      title: n.title,
      description: n.content,
      date: n.createdAt,
      type: n.type,
      url: "#"
    });
  });

  // 5. Ordenamos TODO cronológicamente y devolvemos solo las últimas 30 cosas
  return mixed
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);
}