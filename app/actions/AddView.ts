'use server';

import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { cookies } from 'next/headers';

export async function addView(gameId: number) {
  // 1. Verificamos Cookie para evitar spam de visitas (Cooldown 24h)
  const cookieStore = await cookies();
  const cookieName = `viewed_game_${gameId}`;
  const hasViewed = cookieStore.get(cookieName);

  if (hasViewed) {
    // Si ya tiene la cookie, retornamos null silenciosamente y NO tocamos la DB
    return null;
  }

  try {
    // 2. Primero obtenemos el valor actual de views
    const currentGame = await db.select({ views: games.views }).from(games).where(eq(games.id, gameId));

    let updatedGame;

    // 3. Si es NULL, lo forzamos a 1. Si tiene valor, lo incrementamos.
    const currentViews = currentGame[0]?.views;
    if (currentViews === null) {
       updatedGame = await db.update(games).set({ views: 1 }).where(eq(games.id, gameId)).returning();
    } else {
       updatedGame = await db.update(games).set({ views: sql`${games.views} + 1` }).where(eq(games.id, gameId)).returning();
    }

    // 4. Establecemos la Cookie para marcar que ya visitó este juego hoy
    cookieStore.set(cookieName, 'true', {
      maxAge: 60 * 60 * 24, // 24 horas (en segundos)
      httpOnly: true,       // Seguridad: JS del cliente no puede tocarla
      path: '/',            // Accesible en todo el sitio
      secure: process.env.NODE_ENV === 'production' // Solo HTTPS en producción
    });

    return updatedGame;

  } catch (error) {
    console.error("Error updating game views:", error);
    return null; 
  }
}
