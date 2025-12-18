import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message, model } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ reply: "❌ Message vide" });
    }

    // ===== CHATGPT =====
    if (model === "gpt") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: message }]
        })
      });

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;

      return NextResponse.json({
        reply: reply || "❌ ChatGPT n'a pas répondu"
      });
    }

    // ===== GEMINI =====
    if (model === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }]
          })
        }
      );

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      return NextResponse.json({
        reply: reply || "❌ Gemini n'a pas répondu"
      });
    }

    return NextResponse.json({ reply: "❌ Modèle inconnu" });

  } catch {
    return NextResponse.json({ reply: "❌ Erreur serveur" });
  }
}
