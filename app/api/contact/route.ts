import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_CONTACT;

    if (!webhookUrl) {
      console.error("❌ ERROR: La variable DISCORD_WEBHOOK_CONTACT está vacía.");
      return NextResponse.json(
        { error: "Configuración del servidor incompleta (Falta Webhook)" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const name = (body.name || "").toString().trim();
    const email = (body.email || "").toString().trim();
    const subject = (body.subject || "").toString().trim();
    const message = (body.message || "").toString().trim();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    if (subject.length > 120 || message.length > 1000) {
      return NextResponse.json(
        { error: "Mensaje demasiado largo" },
        { status: 400 }
      );
    }

    // 🎨 EMBED PROFESIONAL con colores de BoceGames
    const embed = {
      title: "📨 Nuevo mensaje de contacto",
      description: message,
      color: 0x10B981, // Verde Emerald-500 de BoceGames (tu color principal)
      fields: [
        {
          name: "👤 Nombre/Alias",
          value: name || "Anónimo",
          inline: true
        },
        {
          name: "📧 Email",
          value: `\`${email}\``,
          inline: true
        },
        {
          name: "📝 Asunto",
          value: subject || "Sin asunto",
          inline: false
        }
      ],
      thumbnail: {
        url: "https://i.ibb.co/GfBGN0ch/favicon.png" // Tu favicon como icono (cámbialo por tu dominio)
      },
      footer: {
        text: "BoceGames · Contact form",
        icon_url: "https://i.ibb.co/GfBGN0ch/favicon.png" // Tu logo aquí
      },
      timestamp: new Date().toISOString()
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        embeds: [embed]  // ✨ Embed en lugar de texto plano
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Error Discord (${res.status}):`, errorText);
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje a Discord" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Excepción en API Contacto:", error);
    return NextResponse.json(
      { error: "Error interno procesando la solicitud" },
      { status: 500 }
    );
  }
}

