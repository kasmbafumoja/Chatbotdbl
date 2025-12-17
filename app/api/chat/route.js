import { NextResponse } from "next/server";

// Fonction pour logger sur Vercel
const log = (msg, data = "") => {
  console.log(`[API Chat] ${msg}`, data);
};

export async function POST(req) {
  try {
    const { message, model } = await req.json();

    if (!message || message.trim() === "") {
      return NextResponse.json({ reply: "❌ Message vide" });
    }

    log("Message reçu :", message);
    log("Modèle choisi :", model);

    // ===== ChatGPT =====
    if (model === "gpt") {
      if (!process.env.OPENAI_API_KEY) {
        log("Erreur : OPENAI_API_KEY non définie");
        return NextResponse.json({ reply: "❌ Clé OpenAI manquante" });
      }

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
      log("Réponse brute GPT :", data);

      const reply = data?.choices?.[0]?.message?.content;
      if (!reply) {
        return NextResponse.json({ reply: "❌ GPT n'a pas renvoyé de réponse" });
      }

      return NextResponse.json({ reply });
    }

    // ===== Gemini =====
    if (model === "gemini") {
      if (!process.env.GEMINI_API_KEY) {
        log("Erreur : GEMINI_API_KEY non définie");
        return NextResponse.json({ reply: "❌ Clé Gemini manquante" });
      }

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
      log("Réponse brute Gemini :", data);

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) {
        return NextResponse.json({ reply: "❌ Gemini n'a pas renvoyé de réponse" });
      }

      return NextResponse.json({ reply });
    }

    // Modèle inconnu
    return NextResponse.json({ reply: "❌ Modèle inconnu" });

  } catch (err) {
    console.error("[API Chat] Erreur serveur :", err);
    return NextResponse.json({ reply: "❌ Erreur serveur" });
  }
}
