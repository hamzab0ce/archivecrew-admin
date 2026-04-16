import { db } from "@/lib/db";
import { games, linksDescarga, gamesGenres } from "@/lib/schema";
import { createGameSchema } from "@/lib/validators/game";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const rawGenres = formData.get("genres") as string;
    const genres = rawGenres.split(",").map((genre) => genre.trim());
    
    // 1. RECUPERAMOS LOS CAMPOS
    const password = formData.get("password") as string | null;
    const instructions = formData.get("instructions") as string | null;
    const captura = formData.get("captura") as string | null;
    const fileSize = formData.get("fileSize") as string | null;
    const version = formData.get("version") as string | null;
    const creditSource = formData.get("creditSource") as string | null;
    
    // --- NUEVO CAMPO DE REQUISITOS LARGOS ---
    const reqMinimos = formData.get("reqMinimos") as string | null; 
    // ----------------------------------------

    const rawData = {
      ...Object.fromEntries(formData),
      genres,
      download_links: JSON.parse(formData.get("download_links") as string),
      password: password || null,
      instructions: instructions || null,
      captura: captura || null,
      fileSize: fileSize || null,
      version: version || null,
      creditSource: creditSource || null,
      reqMinimos: reqMinimos || null, // ← ¡AÑADIDO!
    };

    // Validación con Zod
    const parsed = createGameSchema.safeParse(rawData);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors, data: null },
        { status: 400 }
      );
    }

    const { title, cover_url, download_links, requeriments, description, platform } = parsed.data;

    // Recuperamos los valores finales (si Zod no los tiene, usamos los de arriba)
    const finalPassword = "password" in parsed.data ? (parsed.data as any).password : password;
    const finalInstructions = "instructions" in parsed.data ? (parsed.data as any).instructions : instructions;
    const finalCaptura = "captura" in parsed.data ? (parsed.data as any).captura : captura;
    const finalFileSize = "fileSize" in parsed.data ? (parsed.data as any).fileSize : fileSize;
    const finalVersion = "version" in parsed.data ? (parsed.data as any).version : version;
    const finalCreditSource = "creditSource" in parsed.data ? (parsed.data as any).creditSource : creditSource;
    
    // --- VALOR FINAL DE REQUISITOS ---
    const finalReqMinimos = "reqMinimos" in parsed.data ? (parsed.data as any).reqMinimos : reqMinimos;
    // ---------------------------------

    const result = await db.insert(games).values({
      platform,
      title,
      requeriments: platform === "PS2" ? null : requeriments,
      reqMinimos: finalReqMinimos || null,
      cover_url, 
      captura: finalCaptura || null, 
      fileSize: finalFileSize || null,
      version: finalVersion || null,
      creditSource: finalCreditSource || null, 
      content: description,
      password: finalPassword || null,
      instructions: finalInstructions || null,
    }).returning();

    const gameId = result[0]?.id;

    if (gameId) {
      // Insertar enlaces
      if (download_links && download_links.length > 0) {
        await db.insert(linksDescarga).values(
          download_links.map((link: any) => ({
            juego_id: gameId,
            link: link.link,
            label: link.label,
            type: link.type
          }))
        );
      }

      // Insertar géneros
      if (genres && genres.length > 0) {
        await db.insert(gamesGenres).values(
          genres.map((genre) => ({
            game_id: gameId,
            genre
          }))
        );
      }
    }

    return NextResponse.json({ error: null });
  } catch (e: unknown) {
    console.log(e);
    const message = e instanceof Error ? e.message : "Error interno del servidor";
    return NextResponse.json({ error: [message], data: null }, { status: 500 });
  }
}