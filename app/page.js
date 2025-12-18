"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [model, setModel] = useState("gpt");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, model })
      });

      const data = await res.json();
      setReply(data.reply || "❌ Aucune réponse");
    } catch {
      setReply("❌ Erreur de connexion");
    }

    setLoading(false);
  };

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h2 style={styles.title}>🤖 AI Assistant</h2>

        <select
          style={styles.select}
          value={model}
          onChange={e => setModel(e.target.value)}
        >
          <option value="gpt">ChatGPT</option>
          <option value="gemini">Gemini</option>
        </select>

        <textarea
          style={styles.textarea}
          placeholder="Écris ton message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />

        <button style={styles.button} onClick={sendMessage}>
          {loading ? "⏳ Réponse..." : "Envoyer"}
        </button>

        {reply && (
          <div style={styles.response}>
            <strong>Réponse :</strong>
            <p>{reply}</p>
          </div>
        )}
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
    padding: 20
  },
  card: {
    background: "#0d0d0d",
    color: "#fff",
    width: "100%",
    maxWidth: 480,
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.7)"
  },
  title: {
    textAlign: "center",
    marginBottom: 10
  },
  select: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    border: "none"
  },
  textarea: {
    width: "100%",
    height: 120,
    padding: 10,
    borderRadius: 8,
    border: "none",
    marginBottom: 10
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    background: "#00c6ff",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer"
  },
  response: {
    marginTop: 15,
    background: "#1a1a1a",
    padding: 12,
    borderRadius: 10
  }
};
