import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    // On récupère l'historique envoyé par le frontend
    const { messages } = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Tu es Kas Universe, un assistant IA humain, intelligent, calme et bienveillant. Tu aides l'utilisateur comme un ami proche." 
        },
        ...messages // Transmission de tout l'historique à l'IA
      ]
    });

    return new Response(JSON.stringify({ text: completion.choices[0].message.content }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Erreur API OpenAI:", err);
    return new Response(JSON.stringify({ text: "❌ Impossible de répondre. Vérifie ta clé API sur Vercel." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
