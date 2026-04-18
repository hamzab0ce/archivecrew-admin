'use server';

import { db } from '@/lib/db'
import { games, linksDescarga, gamesGenres } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { decodeJwt } from 'jose'

const CF_WEBHOOK = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/956a24bd-f0e1-4c7d-9ac7-2a051bdbda4c";

async function getUserData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return { role: 'helper', username: 'Anonimo' };
  try {
    const decoded = decodeJwt(token);
    return { role: decoded.role as string, username: decoded.username as string };
  } catch (e) {
    return { role: 'helper', username: 'Anonimo' };
  }
}

export async function updateGame(id: number, formData: FormData) {
  const { role, username } = await getUserData();
  const isAdmin = role === 'admin';

  // 1. OBTENER EL JUEGO ACTUAL PARA COMPARAR
  const currentGame = await db.query.games.findFirst({
    where: eq(games.id, id),
    with: { linksDescarga: true, gamesGenres: true }
  });

  if (!currentGame) return { success: false, message: 'Juego no encontrado' };

  const title = formData.get('title') as string;
  const cover_url = formData.get('cover_url') as string;
  const content = formData.get('content') as string;
  const captura = formData.get('captura') as string;
  const platform = formData.get('platform') as string;
  const requeriments = formData.get('requeriments') as string;
  const fileSize = formData.get('fileSize') as string;
  const version = formData.get('version') as string;
  const password = formData.get('password') as string;
  const creditSource = formData.get('creditSource') as string;
  const instructions = formData.get('instructions') as string;
  const reqMinimos = formData.get('reqMinimos') as string;

  // 🔥 LÓGICA DEL CHIVATO VISUAL: Comparación a prueba de fallos (ignora nulls, espacios y saltos de línea)
  const safeStr = (val: string | null | undefined) => (val || '').trim().replace(/\r\n/g, '\n');

  let changedFields: string[] = [];
  if (safeStr(title) !== safeStr(currentGame.title)) changedFields.push('title');
  if (safeStr(cover_url) !== safeStr(currentGame.cover_url)) changedFields.push('cover_url');
  if (safeStr(content) !== safeStr(currentGame.content)) changedFields.push('content');
  if (safeStr(captura) !== safeStr(currentGame.captura)) changedFields.push('captura');
  if (safeStr(platform) !== safeStr(currentGame.platform)) changedFields.push('platform');
  if (safeStr(requeriments) !== safeStr(currentGame.requeriments)) changedFields.push('requeriments');
  if (safeStr(reqMinimos) !== safeStr(currentGame.reqMinimos)) changedFields.push('reqMinimos');
  if (safeStr(fileSize) !== safeStr(currentGame.fileSize)) changedFields.push('fileSize');
  if (safeStr(version) !== safeStr(currentGame.version)) changedFields.push('version');
  if (safeStr(password) !== safeStr(currentGame.password)) changedFields.push('password');
  if (safeStr(creditSource) !== safeStr(currentGame.creditSource)) changedFields.push('creditSource');
  if (safeStr(instructions) !== safeStr(currentGame.instructions)) changedFields.push('instructions');

  let linksList: any[] = [];
  try {
    const linksRaw = formData.get('links_json') as string;
    if (linksRaw) linksList = JSON.parse(linksRaw);
    
    // Comparar links de forma segura (normalizamos los enlaces del form antes de comparar)
    const dbLinks = (currentGame.linksDescarga || []).map(l => l.link.trim().toLowerCase()).sort().join(',');
    const formLinks = linksList.map(l => {
      let finalUrl = l.link.trim().toLowerCase();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && finalUrl !== "") {
        finalUrl = `https://${finalUrl}`;
      }
      return finalUrl;
    }).sort().join(',');

    if (formLinks !== dbLinks) changedFields.push('links');
  } catch (e) { console.error("Error parseando enlaces", e); }

  if (linksList.length === 0) {
    return { success: false, message: '❌ Error: No se pueden guardar juegos sin enlaces.' };
  }

  const rawGenres = formData.getAll('genres');
  let genresList: string[] = [];
  if (rawGenres.length > 0) {
    genresList = rawGenres.flatMap(g => g.toString().split(',')).map(g => g.trim()).filter(Boolean);
  } else {
    const singleGenreRaw = formData.get('genres') as string;
    if (singleGenreRaw) genresList = singleGenreRaw.split(',').map(g => g.trim()).filter(Boolean);
  }
  
  // Comparar géneros ignorando mayúsculas/minúsculas
  const dbGenres = (currentGame.gamesGenres?.map(g => g.genre) || []).map(g => (g || '').toUpperCase().trim()).sort().join(',');
  const formGenres = genresList.map(g => g.toUpperCase().trim()).sort().join(',');
  if (formGenres !== dbGenres) {
    changedFields.push('genres');
  }

  try {
    await db.update(games).set({
      title, cover_url, content, captura, platform, requeriments, reqMinimos: reqMinimos || null,
      fileSize, version, password, creditSource, instructions, updatedAt: new Date(),
      status: isAdmin ? 'approved' : 'pending',
      uploader: username,
      rejectReason: null,
      // 🔥 GUARDAMOS LA LISTA DE CAMBIOS (si es admin y aprueba, la vaciamos)
      modifiedFields: isAdmin ? null : JSON.stringify(changedFields)
    }).where(eq(games.id, id));

    await db.delete(linksDescarga).where(eq(linksDescarga.juego_id, id));
    
    await db.insert(linksDescarga).values(
      linksList.map((link, index) => {
        let finalUrl = link.link.trim();
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
          finalUrl = `https://${finalUrl}`;
        }

        return {
          juego_id: id, 
          link: finalUrl, 
          label: index === 0 ? 'Directo' : `Mirror ${index}`, 
          type: index === 0 ? 'MAIN' : 'MIRROR'
        };
      })
    );

    await db.delete(gamesGenres).where(eq(gamesGenres.game_id, id));
    if (genresList.length > 0) {
      const uniqueGenres = Array.from(new Set(genresList));
      await db.insert(gamesGenres).values(uniqueGenres.map((g) => ({ game_id: id, genre: g })));
    }
    
    if (isAdmin) fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);

    revalidatePath('/'); revalidatePath('/panel/editor');
    revalidatePath('/panel/mis-aportes'); revalidatePath('/panel/pendientes');
    
    return { success: true, message: isAdmin ? '✅ Publicado y registro de cambios limpio' : '✅ Cambios registrados para revisión' };
  } catch (error) {
    return { success: false, message: '❌ Error en la base de datos' };
  }
}

export async function deleteGame(id: number) {
  const { role } = await getUserData();
  if (role !== 'admin') return { success: false, message: '❌ ACCESO DENEGADO' };
  try {
    await db.delete(games).where(eq(games.id, id));
    fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);
    revalidatePath('/'); revalidatePath('/panel/editor');
    return { success: true, message: '🗑️ Juego eliminado' };
  } catch (error) { return { success: false, message: '❌ Error al borrar el juego' }; }
}