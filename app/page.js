"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Salut, je suis prêt à t'aider." }
  ]);
  const [input, setInput] = useState("");
  const [chatVisible, setChatVisible] = useState(false);
  const messagesEndRef = useRef(null);

  const startChat = () => setChatVisible(true);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollToBottom, [messages, chatVisible]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    const botPlaceholder = { role: "assistant", text: "⏳ Je réfléchis…", thinking: true };

    // On ajoute le message utilisateur et l'état de réflexion
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, botPlaceholder]);
    setInput("");

    try {
      // On prépare l'historique pour l'API (format attendu par OpenAI)
      const apiHistory = newMessages.map(m => ({
        role: m.role,
        content: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiHistory }) // Envoi de l'historique
      });
      
      const data = await res.json();

      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { role: "assistant", text: data.text } : m
      ));
    } catch (err) {
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { role: "assistant", text: "❌ Erreur de connexion." } : m
      ));
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") sendMessage(); };

  return (
    <div className="app">
      <div className="bg"></div>

      {!chatVisible ? (
        <div className="welcome">
          <div className="logo">🌌 KAS UNIVERSE</div>
          <p>Un assistant IA humain.<br />Intelligent, calme, et toujours là pour toi.</p>
          <button className="start-btn" onClick={startChat}>Commencer</button>
        </div>
      ) : (
        <div className="chat">
          <div className="messages">
            {messages.map((m,i)=>(
              <div key={i} className={`msg ${m.role} ${m.thinking ? "thinking" : ""}`}>
                {m.text.split("\n").map((line, idx) => <p key={idx}>{line}</p>)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Écris ici…"
              onKeyDown={handleKey}
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}

      <style jsx>{`
        :root { --c1:#7f00ff; --c2:#00e5ff; }
        .bg { position:absolute; width:200%; height:200%; background:linear-gradient(120deg,var(--c1),var(--c2),var(--c1)); filter:blur(140px); opacity:0.3; animation: moveBg 25s infinite linear; z-index:-1; }
        @keyframes moveBg { 0%{transform:translate(-30%,-30%);} 50%{transform:translate(-10%,-10%);} 100%{transform:translate(-30%,-30%);} }
        .app { position:relative; height:100vh; display:flex; flex-direction:column; font-family:'Segoe UI',Arial,sans-serif; color:white; overflow:hidden; }
        .welcome { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
        .logo { font-size:44px; font-weight:bold; background:linear-gradient(90deg,var(--c1),var(--c2)); -webkit-background-clip:text; color:transparent; }
        .start-btn { margin-top:30px; padding:14px 34px; border:none; border-radius:30px; font-size:16px; cursor:pointer; background:linear-gradient(90deg,var(--c1),var(--c2)); color:white; transition: transform 0.2s; }
        .start-btn:hover { transform: scale(1.05); }
        .chat { flex:1; display:flex; flex-direction:column; max-width:800px; margin:0 auto; width:100%; }
        .messages { flex:1; padding:20px; overflow-y:auto; scrollbar-width: thin; }
        .msg { max-width:82%; margin-bottom:14px; padding:14px 18px; border-radius:16px; line-height:1.4; background: rgba(255,255,255,0.12); }
        .user { margin-left:auto; background:linear-gradient(90deg,#0066ff,#00ccff); border-bottom-right-radius:4px; }
        .assistant { margin-right:auto; background: rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.2); backdrop-filter:blur(6px); border-bottom-left-radius:4px; }
        .thinking { opacity:0.7; font-style:italic; }
        .input { display:flex; padding:20px; background:rgba(0,0,0,0.2); backdrop-filter:blur(10px); border-top:1px solid rgba(255,255,255,0.1); }
        .input input { flex:1; padding:13px 20px; border-radius:25px; border:none; outline:none; font-size:15px; background: rgba(255,255,255,0.15); color:white; }
        .input button { margin-left:10px; width:46px; height:46px; border-radius:50%; border:none; cursor:pointer; background:linear-gradient(90deg,var(--c1),var(--c2)); color:white; font-size:18px; }
        @media(max-width:480px){ .logo{font-size:36px;} .msg{max-width:90%;} }
      `}</style>
    </div>
  );
}
