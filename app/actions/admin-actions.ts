'use server';

import { db } from '@/lib/db'
import { games, news } from '@/lib/schema' // 🔥 Añadido 'news'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const CF_WEBHOOK = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/956a24bd-f0e1-4c7d-9ac7-2a051bdbda4c";

export async function approveGame(id: number) {
  try {
    // 1. Buscamos el título del juego para la notificación
    const juego = await db.query.games.findFirst({
      where: eq(games.id, id),
    });

    if (!juego) return { success: false, message: 'Juego no encontrado' };

    // 2. Lo aprobamos
    await db.update(games).set({ 
      status: 'approved',
      rejectReason: null,
      updatedAt: new Date() 
    }).where(eq(games.id, id));

    // 3. 🔥 CREAMOS LA NOTIFICACIÓN DE NUEVO JUEGO
    await db.insert(news).values({
      title: `Nuevo juego: ${juego.title}`,
      content: '¡Ya disponible en el catálogo para descargar!',
      type: 'new'
    });

    // 4. Despliega los cambios a todo el mundo
    fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);

    revalidatePath('/panel/pendientes');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Error al aprobar' };
  }
}

export async function rejectGame(id: number, formData: FormData) {
  const reason = formData.get('reason') as string || 'Rechazado sin motivo específico.';

  try {
    await db.update(games).set({ 
      status: 'rejected',
      rejectReason: reason,
      updatedAt: new Date() 
    }).where(eq(games.id, id));

    revalidatePath('/panel/pendientes');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Error al rechazar' };
  }
}