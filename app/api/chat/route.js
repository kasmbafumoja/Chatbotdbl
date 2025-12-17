import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message || message.trim() === "") {
      return NextResponse.json({ reply: "❌ Message vide" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ reply: "❌ GEMINI_API_KEY manquante" });
    }

    const model = "gemini-2.5-pro"; // <-- modèle valide

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();
    console.log("[Gemini Debug] data =", JSON.stringify(data, null, 2));

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return NextResponse.json({
        reply: "❌ Gemini n'a pas renvoyé de réponse. Voici la réponse brute : " + JSON.stringify(data)
      });
    }

    return NextResponse.json({ reply });

  } catch (err) {
    console.error("[Gemini Error]", err);
    return NextResponse.json({ reply: "❌ Erreur serveur : " + err.message });
  }
}
