// 1. EL JURAMENTO ESTÁTICO (Descomentado y en modo force-static)
export const dynamic = 'force-static';

import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { games } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { generateSafeUrl } from '@/lib/slugify';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://archivecrew.xyz';

  const staticRoutes = [
    '',           
    '/ayuda',
    '/privacy',
    '/request',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8, 
  }));

  // 2. CONSULTA PLANA: Nada de unstable_cache. En static export, se ejecuta 1 vez aquí y muere.
  const gamesList = await db
    .select({ id: games.id, title: games.title, updatedAt: games.updatedAt })
    .from(games)
    .orderBy(desc(games.id));

  const gameRoutes = gamesList.map((game) => ({
    url: `${baseUrl}/game/${generateSafeUrl(game.title)}/${game.id}`,
    lastModified: game.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9, 
  }));

  return [...staticRoutes, ...gameRoutes];
}