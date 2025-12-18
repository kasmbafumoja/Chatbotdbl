"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      setReply(data.reply);
    } catch {
      setReply("Erreur de connexion.");
    }

    setLoading(false);
  };

  return (
    <main style={styles.main}>
      <div style={styles.box}>
        <h2>👋 Salut, je suis là pour t’aider</h2>

        <textarea
          style={styles.textarea}
          placeholder="Parle-moi naturellement..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />

        <button style={styles.button} onClick={send}>
          {loading ? "Je réfléchis..." : "Envoyer"}
        </button>

        {reply && (
          <div style={styles.reply}>
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
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  box: {
    background: "#020617",
    color: "#e5e7eb",
    width: "100%",
    maxWidth: 500,
    padding: 20,
    borderRadius: 16
  },
  textarea: {
    width: "100%",
    height: 120,
    padding: 10,
    borderRadius: 8,
    border: "none",
    marginTop: 10
  },
  button: {
    width: "100%",
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    background: "#38bdf8",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer"
  },
  reply: {
    marginTop: 15,
    background: "#020617",
    padding: 12,
    borderRadius: 10
  }
};
