"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Salut, je suis Kas Universe. Comment puis-je t'aider aujourd'hui ?" }
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
    const botPlaceholder = { role: "assistant", text: "", thinking: true };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, botPlaceholder]);
    setInput("");

    try {
      const apiHistory = updatedMessages.map(m => ({
        role: m.role,
        content: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiHistory })
      });
      
      const data = await res.json();

      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { role: "assistant", text: data.text, thinking: false } : m
      ));
    } catch (err) {
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { role: "assistant", text: "❌ Désolé, une erreur est survenue.", thinking: false } : m
      ));
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") sendMessage(); };

  return (
    <div className="app">
      <div className="bg"></div>

      {!chatVisible ? (
        <div className="welcome fade-in">
          <div className="logo-container">
            <div className="logo">🌌 KAS UNIVERSE</div>
            <div className="logo-glow"></div>
          </div>
          <p className="description">
            Un assistant IA humain.<br />
            <span>Intelligent, calme, et toujours là pour toi.</span>
          </p>
          <button className="start-btn" onClick={startChat}>
            Commencer l'expérience
          </button>
        </div>
      ) : (
        <div className="chat fade-in">
          <header className="chat-header">
            <span>● Kas Universe Online</span>
          </header>
          
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg-wrapper ${m.role}`}>
                <div className={`msg ${m.thinking ? "thinking-bubble" : ""}`}>
                  {m.thinking ? (
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                  ) : (
                    m.text.split("\n").map((line, idx) => <p key={idx}>{line}</p>)
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="input-glass">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Pose-moi une question..."
                onKeyDown={handleKey}
              />
              <button className="send-btn" onClick={sendMessage}>➤</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :root { --c1:#7f00ff; --c2:#00e5ff; --glass: rgba(255, 255, 255, 0.1); }
        
        .app { position:relative; height: 100dvh; display:flex; flex-direction:column; font-family:'Inter', sans-serif; color:white; overflow:hidden; background: #050505; }
        
        .bg { position:absolute; width:150%; height:150%; background: radial-gradient(circle, var(--c1) 0%, transparent 50%), radial-gradient(circle, var(--c2) 0%, transparent 50%); filter:blur(100px); opacity:0.2; animation: moveBg 20s infinite alternate; z-index:0; }
        @keyframes moveBg { 0%{transform:translate(-25%,-25%);} 100%{transform:translate(10%,10%);} }

        .fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* --- Welcome Screen --- */
        .welcome { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; z-index:1; padding: 20px; }
        .logo-container { position: relative; margin-bottom: 20px; }
        .logo { font-size: 56px; font-weight: 900; background: linear-gradient(90deg, #fff, var(--c2)); -webkit-background-clip: text; color: transparent; letter-spacing: -2px; }
        .logo-glow { position: absolute; top:0; left:0; width:100%; height:100%; background: var(--c2); filter: blur(40px); opacity: 0.3; z-index: -1; }
        .description { font-size: 18px; opacity: 0.8; line-height: 1.6; }
        .description span { font-size: 14px; opacity: 0.6; }
        .start-btn { margin-top: 40px; padding: 16px 40px; border: none; border-radius: 40px; background: white; color: black; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,229,255,0.3); }
        .start-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0,229,255,0.5); }

        /* --- Chat UI --- */
        .chat { flex:1; display:flex; flex-direction:column; z-index:1; max-width: 900px; margin: 0 auto; width: 100%; }
        .chat-header { padding: 15px; text-align: center; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; opacity: 0.5; }
        .messages { flex:1; padding: 20px; overflow-y:auto; display: flex; flex-direction: column; gap: 10px; }
        
        .msg-wrapper { display: flex; width: 100%; animation: msgSlide 0.3s ease-out; }
        @keyframes msgSlide { from { opacity:0; transform: translateY(5px); } to { opacity:1; transform: translateY(0); } }
        
        .user { justify-content: flex-end; }
        .assistant { justify-content: flex-start; }

        .msg { max-width: 75%; padding: 14px 20px; border-radius: 20px; font-size: 15px; line-height: 1.5; position: relative; }
        .user .msg { background: linear-gradient(135deg, var(--c1), #4e00ff); border-bottom-right-radius: 4px; box-shadow: 0 4px 15px rgba(127,0,255,0.2); }
        .assistant .msg { background: var(--glass); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-bottom-left-radius: 4px; }

        /* --- Typing Animation --- */
        .typing-dots { display: flex; gap: 5px; padding: 5px 0; }
        .typing-dots span { width: 8px; height: 8px; background: rgba(255,255,255,0.5); border-radius: 50%; animation: pulse 1.4s infinite ease-in-out both; }
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes pulse { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }

        /* --- Input --- */
        .input-container { padding: 25px; }
        .input-glass { display: flex; align-items: center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); padding: 8px 10px 8px 20px; border-radius: 50px; }
        .input-glass input { flex:1; background: transparent; border: none; color: white; outline: none; font-size: 15px; }
        .send-btn { width: 42px; height: 42px; border-radius: 50%; border: none; background: white; color: black; cursor: pointer; transition: 0.2s; font-size: 18px; }
        .send-btn:hover { transform: scale(1.05); background: var(--c2); }

        @media(max-width:480px){ .logo{font-size:38px;} .msg{max-width:85%;} .input-container{padding: 15px;} }
      `}</style>
    </div>
  );
}
