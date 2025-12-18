import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({
        reply: "Dis-moi simplement ce que tu veux savoir 🙂"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
Tu es un assistant IA humain, chaleureux et intelligent.
Tu parles comme un ami de confiance.
Tu expliques simplement, clairement et naturellement.
Tu aides sans juger.
Tu réponds normalement à la question posée.
Tu ne fais pas de discours inutiles.
`
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    return NextResponse.json({
      reply: reply || "Hmm… peux-tu reformuler ?"
    });

  } catch {
    return NextResponse.json({
      reply: "Désolé, j’ai eu un petit souci. Réessaie."
    });
  }
}
