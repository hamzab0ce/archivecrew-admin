'use server';

import { db } from '@/lib/db'
import { games, linksDescarga, gamesGenres } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { decodeJwt } from 'jose'

// 🔥 TU WEBHOOK DIRECTO
const CF_WEBHOOK = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/956a24bd-f0e1-4c7d-9ac7-2a051bdbda4c";

// 🕵️‍♂️ FUNCIÓN PARA LEER EL PASE VIP
async function getUserRole() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return 'helper';
  
  try {
    const decoded = decodeJwt(token);
    return decoded.role as string;
  } catch (e) {
    return 'helper';
  }
}

// 1. ACTUALIZAR JUEGO
export async function updateGame(id: number, formData: FormData) {
  const role = await getUserRole();
  const isAdmin = role === 'admin';

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
      fileSize, version, password, creditSource, instructions, updatedAt: new Date(),
      
      // 🔥 LA MAGIA ESTÁ AQUÍ:
      // Si eres tú, se guarda aprobado. Si es Benslay, vuelve al Limbo para revisión.
      status: isAdmin ? 'approved' : 'pending' 
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
    
    // 🚀 AVISAR A CLOUDFLARE SOLO SI ERES EL JEFE
    if (isAdmin) {
      fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);
    }

    // Actualizamos las rutas correctas (las del nuevo panel)
    revalidatePath('/') 
    revalidatePath('/panel/editor')
    revalidatePath('/panel/mis-aportes')
    revalidatePath('/panel/pendientes')
    
    return { 
      success: true, 
      message: isAdmin ? '✅ Juego actualizado y publicado' : '✅ Corrección enviada a revisión. ¡Gracias!' 
    }
  } catch (error) {
    console.error("Error de Drizzle al actualizar:", error)
    return { success: false, message: '❌ Error al actualizar la base de datos' }
  }
}

// 2. BORRAR JUEGO
export async function deleteGame(id: number) {
  // 🛡️ ESCUDO DE SEGURIDAD: Solo tú puedes borrar
  const role = await getUserRole();
  if (role !== 'admin') {
    return { success: false, message: '❌ ACCESO DENEGADO: Solo el administrador Supremo puede borrar juegos.' }
  }

  try {
    await db.delete(games).where(eq(games.id, id))
    
    // 🚀 AVISAR A CLOUDFLARE
    fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);

    revalidatePath('/')
    revalidatePath('/panel/editor')
    return { success: true, message: '🗑️ Juego eliminado permanentemente' }
  } catch (error) {
    console.error("Error al borrar:", error)
    return { success: false, message: '❌ Error al borrar el juego' }
  }
}