'use server';

import { db } from '@/lib/db'
import { games } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const CF_WEBHOOK = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/956a24bd-f0e1-4c7d-9ac7-2a051bdbda4c";

export async function approveGame(id: number) {
  try {
    await db.update(games).set({ 
      status: 'approved',
      updatedAt: new Date() 
    }).where(eq(games.id, id));

    // 🚀 IMPORTANTE: Al aprobar, reconstruimos la web pública
    fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);

    revalidatePath('/panel/pendientes');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Error al aprobar' };
  }
}

export async function rejectGame(id: number) {
  try {
    await db.update(games).set({ 
      status: 'rejected',
      updatedAt: new Date() 
    }).where(eq(games.id, id));

    revalidatePath('/panel/pendientes');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Error al rechazar' };
  }
}