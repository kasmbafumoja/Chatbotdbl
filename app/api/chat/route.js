import { NextResponse } from "next/server";

export async function POST(req) {
  const { message, model } = await req.json();

  try {
    // ChatGPT
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
      return NextResponse.json({
        reply: data.choices?.[0]?.message?.content || "❌ Réponse vide"
      });
    }

    // Gemini
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await res.json();
    return NextResponse.json({
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Réponse vide"
    });

  } catch (error) {
    return NextResponse.json({ reply: "❌ Erreur serveur" });
  }
}
