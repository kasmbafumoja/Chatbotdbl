"use client"; // important, c'est un Client Component

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { text: "👋 Salut. Dis-moi simplement ce que tu as en tête.", from: "bot" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const send = async () => {
    if (!message.trim()) return;

    const userMsg = { text: message, from: "user" };
    setMessages(prev => [...prev, userMsg]);
    setMessage("");

    const botThinking = { text: "Je réfléchis…", from: "bot", thinking: true };
    setMessages(prev => [...prev, botThinking]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      const botReply = { text: data.reply || "Hmm… peux-tu reformuler ?", from: "bot" };

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = botReply; // remplacer "Je réfléchis…"
        return updated;
      });

    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { text: "Erreur de connexion.", from: "bot" };
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
      {/* Background animé */}
      <div style={styles.bg}></div>

      <div style={styles.chatContainer}>
        <div style={styles.messages}>
          {messages.map((m, i) => (
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
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputContainer}>
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Écris ici…"
            onKeyDown={handleKey}
            style={styles.input}
          />
          <button onClick={send} style={styles.btn}>➤</button>
        </div>
      </div>

      {/* Animation CSS */}
      <style jsx global>{`
        @keyframes moveBg {
          0% { transform: translate(-30%, -30%); }
          50% { transform: translate(-10%, -10%); }
          100% { transform: translate(-30%, -30%); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  app: { position: "relative", height: "100vh", fontFamily: "Segoe UI, Arial, sans-serif", overflow: "hidden" },
  bg: {
    position: "absolute",
    width: "200%",
    height: "200%",
    background: "linear-gradient(120deg, #7f00ff, #00e5ff, #7f00ff)",
    filter: "blur(140px)",
    opacity: 0.25,
    animation: "moveBg 25s infinite linear",
  },
  chatContainer: { position: "relative", height: "100%", display: "flex", flexDirection: "column" },
  messages: { flex: 1, padding: 20, overflowY: "auto" },
  msg: { maxWidth: "82%", marginBottom: 14, padding: "14px 18px", borderRadius: 16, lineHeight: 1.4 },
  user: { marginLeft: "auto", background: "linear-gradient(90deg, #0066ff, #00ccff)", borderBottomRightRadius: 4 },
  bot: { marginRight: "auto", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderBottomLeftRadius: 4 },
  thinking: { opacity: 0.7, fontStyle: "italic" },
  inputContainer: { display: "flex", padding: 14, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)" },
  input: { flex: 1, padding: "13px 16px", borderRadius: 25, border: "none", outline: "none", fontSize: 15 },
  btn: { marginLeft: 10, width: 46, height: 46, borderRadius: "50%", border: "none", cursor: "pointer", background: "linear-gradient(90deg, #7f00ff, #00e5ff)", color: "white", fontSize: 18 }
};
