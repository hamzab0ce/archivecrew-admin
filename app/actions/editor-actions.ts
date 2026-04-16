'use server';

import { db } from '@/lib/db'
import { games, linksDescarga, gamesGenres } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// 🔥 TU WEBHOOK DIRECTO
const CF_WEBHOOK = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/956a24bd-f0e1-4c7d-9ac7-2a051bdbda4c";

// 1. ACTUALIZAR JUEGO
export async function updateGame(id: number, formData: FormData) {
  const title = formData.get('title') as string
  const cover_url = formData.get('cover_url') as string
  const content = formData.get('content') as string
  const captura = formData.get('captura') as string
  const platform = formData.get('platform') as string
  const requeriments = formData.get('requeriments') as string
  const fileSize = formData.get('fileSize') as string
  const version = formData.get('version') as string
  const password = formData.get('password') as string
  const creditSource = formData.get('creditSource') as string
  const instructions = formData.get('instructions') as string
  const reqMinimos = formData.get('reqMinimos') as string 

  let linksList: any[] = []
  try {
    const linksRaw = formData.get('links_json') as string
    if (linksRaw) linksList = JSON.parse(linksRaw)
  } catch (e) {
    console.error("Error al parsear enlaces", e)
  }

  const genresRaw = formData.get('genres') as string
  const genresList = genresRaw ? genresRaw.split(',').map(g => g.trim()).filter(Boolean) : []

  try {
    await db.update(games).set({
      title, cover_url, content, captura, platform, requeriments, reqMinimos: reqMinimos || null,
      fileSize, version, password, creditSource, instructions, updatedAt: new Date()
    }).where(eq(games.id, id))

    await db.delete(linksDescarga).where(eq(linksDescarga.juego_id, id))
    
    if (linksList.length > 0) {
      await db.insert(linksDescarga).values(
        linksList.map((link) => ({
          juego_id: id, link: link.link, label: link.label || 'LINK',
          type: (link.label || '').toUpperCase().includes('DIRECTO') ? 'MAIN' : 'MIRROR'
        }))
      )
    }

    await db.delete(gamesGenres).where(eq(gamesGenres.game_id, id))
    
    if (genresList.length > 0) {
      await db.insert(gamesGenres).values(genresList.map((g) => ({ game_id: id, genre: g })))
    }
    
    // 🚀 AVISAR A CLOUDFLARE
    fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);

    revalidatePath('/') 
    revalidatePath('/admin/editor')
    return { success: true, message: '✅ Juego actualizado' }
  } catch (error) {
    console.error("Error de Drizzle al actualizar:", error)
    return { success: false, message: '❌ Error al actualizar la base de datos' }
  }
}

// 2. BORRAR JUEGO
export async function deleteGame(id: number) {
  try {
    await db.delete(games).where(eq(games.id, id))
    
    // 🚀 AVISAR A CLOUDFLARE
    fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);

    revalidatePath('/')
    revalidatePath('/admin/editor')
    return { success: true, message: '🗑️ Juego eliminado permanentemente' }
  } catch (error) {
    console.error("Error al borrar:", error)
    return { success: false, message: '❌ Error al borrar el juego' }
  }
}