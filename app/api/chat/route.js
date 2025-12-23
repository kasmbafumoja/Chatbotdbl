import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    // On récupère maintenant 'messages' au lieu de juste 'message'
    const { messages } = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Tu es Kas Universe, un assistant IA humain, intelligent, calme et bienveillant. Tu parles comme un ami proche." 
        },
        ...messages // On transmet tout l'historique à OpenAI
      ]
    });

    return new Response(JSON.stringify({ text: completion.choices[0].message.content }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ text: "❌ Impossible de répondre." }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
