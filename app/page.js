"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState([{ text: "👋 Salut.\nDis-moi simplement ce que tu as en tête.", from: "bot" }]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!message.trim()) return;

    // Ajouter message utilisateur
    setReply(prev => [...prev, { text: message, from: "user" }]);
    setLoading(true);
    setMessage("");

    // Ajouter message temporaire bot "je réfléchis"
    setReply(prev => [...prev, { text: "Je réfléchis…", from: "bot", thinking: true }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      // Mettre à jour le dernier message bot
      setReply(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = { text: data.reply, from: "bot" };
        return updated;
      });

    } catch {
      setReply(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = { text: "Erreur de connexion.", from: "bot" };
        return updated;
      });
    }

    setLoading(false);
  };

  const handleKey = e => {
    if (e.key === "Enter") send();
  };

  return (
    <div style={styles.app}>
      <div className="bg" style={styles.bg}></div>

      <div style={styles.chat}>
        <div style={styles.messages}>
          {reply.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.msg,
                ...(m.from === "user" ? styles.user : styles.bot),
                ...(m.thinking ? styles.thinking : {})
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div style={styles.input}>
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Écris ici…"
            onKeyDown={handleKey}
            style={styles.inputField}
          />
          <button onClick={send} style={styles.inputBtn}>➤</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: { position: "relative", height: "100vh", fontFamily: "Segoe UI, Arial, sans-serif" },
  bg: {
    position: "absolute",
    width: "200%",
    height: "200%",
    background: "linear-gradient(120deg, #7f00ff, #00e5ff, #7f00ff)",
    filter: "blur(140px)",
    opacity: 0.25,
    animation: "moveBg 25s infinite linear",
  },
  chat: { position: "relative", display: "flex", flexDirection: "column", height: "100%" },
  messages: { flex: 1, padding: 20, overflowY: "auto" },
  msg: { maxWidth: "82%", marginBottom: 14, padding: "14px 18px", borderRadius: 16, lineHeight: 1.4 },
  user: { marginLeft: "auto", background: "linear-gradient(90deg, #0066ff, #00ccff)", borderBottomRightRadius: 4 },
  bot: { marginRight: "auto", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderBottomLeftRadius: 4 },
  thinking: { opacity: 0.7, fontStyle: "italic" },
  input: { display: "flex", padding: 14, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)" },
  inputField: { flex: 1, padding: "13px 16px", borderRadius: 25, border: "none", outline: "none", fontSize: 15 },
  inputBtn: { marginLeft: 10, width: 46, height: 46, borderRadius: "50%", border: "none", cursor: "pointer", background: "linear-gradient(90deg, #7f00ff, #00e5ff)", color: "white", fontSize: 18 }
};
