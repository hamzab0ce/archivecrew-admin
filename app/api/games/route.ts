import { db } from "@/lib/db";
import { games, linksDescarga, gamesGenres, news } from "@/lib/schema";
import { createGameSchema } from "@/lib/validators/game";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

const CF_WEBHOOK = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/956a24bd-f0e1-4c7d-9ac7-2a051bdbda4c";

export async function POST(req: NextRequest) {
  try {
    // 🕵️‍♂️ 1. LEEMOS EL PASE VIP PARA SABER QUIÉN ES
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    
    let role = "helper"; 
    let uploaderName = "Agente";

    if (token) {
      try {
        const decoded = decodeJwt(token);
        role = decoded.role as string;
        uploaderName = decoded.username as string;
      } catch (e) {
        console.error("Error leyendo token en la subida");
      }
    }

    const isAdmin = role === "admin";
    // 🔥 Si es admin, se aprueba directo. Si es ayudante, se va al limbo.
    const gameStatus = isAdmin ? "approved" : "pending";

    // 2. RECUPERAMOS LOS DATOS DEL FORMULARIO
    const formData = await req.formData();
    const rawGenres = formData.get("genres") as string;
    const genres = rawGenres.split(",").map((genre) => genre.trim());
    
    const password = formData.get("password") as string | null;
    const instructions = formData.get("instructions") as string | null;
    const captura = formData.get("captura") as string | null;
    const fileSize = formData.get("fileSize") as string | null;
    const version = formData.get("version") as string | null;
    const creditSource = formData.get("creditSource") as string | null;
    const reqMinimos = formData.get("reqMinimos") as string | null; 

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
      reqMinimos: reqMinimos || null,
    };

    const parsed = createGameSchema.safeParse(rawData);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors, data: null },
        { status: 400 }
      );
    }

    const { title, cover_url, download_links, requeriments, description, platform } = parsed.data;

    const finalPassword = "password" in parsed.data ? (parsed.data as any).password : password;
    const finalInstructions = "instructions" in parsed.data ? (parsed.data as any).instructions : instructions;
    const finalCaptura = "captura" in parsed.data ? (parsed.data as any).captura : captura;
    const finalFileSize = "fileSize" in parsed.data ? (parsed.data as any).fileSize : fileSize;
    const finalVersion = "version" in parsed.data ? (parsed.data as any).version : version;
    const finalCreditSource = "creditSource" in parsed.data ? (parsed.data as any).creditSource : creditSource;
    const finalReqMinimos = "reqMinimos" in parsed.data ? (parsed.data as any).reqMinimos : reqMinimos;

    // 💾 3. GUARDAMOS EL JUEGO CON SU ESTADO Y AUTOR
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
      status: gameStatus, // 🟢 o 🟡
      uploader: uploaderName, // Ej: "Hamza"
    }).returning();

    const gameId = result[0]?.id;

    if (gameId) {
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

      if (genres && genres.length > 0) {
        await db.insert(gamesGenres).values(
          genres.map((genre) => ({
            game_id: gameId,
            genre
          }))
        );
      }

      // 📢 4. ACCIONES EXCLUSIVAS DEL ADMIN
      // Solo avisamos a la web pública si el juego se ha aprobado (lo sube el Admin)
      if (isAdmin) {
        try {
          await db.insert(news).values({
            title: `🎮 ¡Nuevo juego disponible: ${title}!`,
            content: `Hemos subido **${title}** para la plataforma ${platform}. ¡Ya puedes ir a la sección de descargas!`,
            type: 'game'
          });
        } catch (e) {
          console.error("Fallo al crear la auto-noticia:", e);
        }

        fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);
      }
    }

    return NextResponse.json({ error: null });
  } catch (e: unknown) {
    console.log(e);
    const message = e instanceof Error ? e.message : "Error interno del servidor";
    return NextResponse.json({ error: [message], data: null }, { status: 500 });
  }
}