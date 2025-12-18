"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { type: "bot", text: "👋 Salut, je suis prêt à t'aider." }
  ]);
  const [input, setInput] = useState("");
  const [chatVisible, setChatVisible] = useState(false);
  const messagesEndRef = useRef(null);

  const startChat = () => setChatVisible(true);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollToBottom, [messages, chatVisible]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { type: "user", text: input };
    const botMsg = { type: "bot", text: "⏳ Je réfléchis…", thinking: true };

    setMessages(prev => [...prev, userMsg, botMsg]);
    const userText = input;
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();

      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { type: "bot", text: data.text } : m
      ));
    } catch (err) {
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { type: "bot", text: "❌ Impossible de répondre." } : m
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
              <div key={i} className={`msg ${m.type} ${m.thinking ? "thinking" : ""}`}>
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
        .bg { position:absolute; width:200%; height:200%; background:linear-gradient(120deg,var(--c1),var(--c2),var(--c1)); filter:blur(140px); opacity:0.25; animation: moveBg 25s infinite linear; z-index:-1; }
        @keyframes moveBg { 0%{transform:translate(-30%,-30%);}50%{transform:translate(-10%,-10%);}100%{transform:translate(-30%,-30%);} }
        .app { position:relative; height:100vh; display:flex; flex-direction:column; font-family:'Segoe UI',Arial,sans-serif; color:white; }
        .welcome { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
        .logo { font-size:44px; font-weight:bold; background:linear-gradient(90deg,var(--c1),var(--c2)); -webkit-background-clip:text; color:transparent; }
        .start-btn { margin-top:30px; padding:14px 34px; border:none; border-radius:30px; font-size:16px; cursor:pointer; background:linear-gradient(90deg,var(--c1),var(--c2)); color:white; }
        .chat { flex:1; display:flex; flex-direction:column; }
        .messages { flex:1; padding:20px; overflow-y:auto; }
        .msg { max-width:82%; margin-bottom:14px; padding:14px 18px; border-radius:16px; line-height:1.4; }
        .user { margin-left:auto; background:linear-gradient(90deg,#0066ff,#00ccff); border-bottom-right-radius:4px; }
        .bot { margin-right:auto; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); backdrop-filter:blur(8px); border-bottom-left-radius:4px; }
        .thinking { opacity:0.7; font-style:italic; }
        .input { display:flex; padding:14px; background:rgba(0,0,0,0.45); backdrop-filter:blur(10px); }
        .input input { flex:1; padding:13px 16px; border-radius:25px; border:none; outline:none; font-size:15px; }
        .input button { margin-left:10px; width:46px; height:46px; border-radius:50%; border:none; cursor:pointer; background:linear-gradient(90deg,var(--c1),var(--c2)); color:white; font-size:18px; }
        @media(max-width:480px){ .logo{font-size:36px;} .start-btn{padding:12px 28px;font-size:15px;} .msg{max-width:90%;padding:12px 14px;} .input input{font-size:14px;padding:12px;} .input button{width:40px;height:40px;font-size:16px;} }
      `}</style>
    </div>
  );
}
