import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_REQUESTS || "https://discord.com/api/webhooks/1392692184741838888/030_B7pGsa5KAJ5xpnsRKZ9vXkjJbvyocF-Ol7nkaW_h_d4BVkzTERj25nFcdxYTIdYy";

    if (!webhookUrl) {
      console.error("❌ ERROR: La variable DISCORD_WEBHOOK_REQUESTS está vacía.");
      return NextResponse.json(
        { error: "Webhook de peticiones no configurado" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const discordUser = (body.discordUser || "Anónimo").toString().trim();
    const game = (body.game || "Desconocido").toString().trim();
    const reason = (body.reason || "Sin motivo").toString().trim();
    const platform = (body.platform || "No especificada").toString().trim();

    if (!game || !platform) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    if (game.length > 120 || reason.length > 300) {
      return NextResponse.json(
        { error: "Petición demasiado larga" },
        { status: 400 }
      );
    }

    // 🎨 EL EMBED EXACTO, AHORA CON LAS TILDES INVERSAS EN EL EMOJI
    const embed = {
      title: "``🗳️`` NUEVO PEDIDO", // ✨ Las famosas dobles tildes inversas añadidas
      description: `> **Nombre:** ${game}\n> **Motivo:** ${reason}\n> **Plataforma:** ${platform}\n\n**Pedido por:** \`${discordUser}\``,
      color: 15190524, // Color rosita #e7c6de
      footer: {
        text: "Su juego será añadido pronto."
      },
      timestamp: new Date().toISOString()
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        embeds: [embed] 
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Error Discord (${res.status}):`, errorText);
      return NextResponse.json(
        { error: "No se pudo enviar al webhook" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Excepción en API Requests:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}