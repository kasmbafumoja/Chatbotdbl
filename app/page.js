"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Bonjour, je suis Kas Universe. Comment puis-je t'accompagner aujourd'hui ?", isTyping: false }
  ]);
  const [input, setInput] = useState("");
  const [chatVisible, setChatVisible] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const startChat = () => setChatVisible(true);
  
  // Fonction de scroll optimisée
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotThinking]);

  // Fonction pour simuler l'effet d'écriture mot par mot (Style Gemini)
  const typeText = async (fullText) => {
    let currentText = "";
    const words = fullText.split(" ");
    
    // On crée une nouvelle bulle vide pour le bot
    setMessages(prev => [...prev.slice(0, -1), { role: "assistant", text: "", isTyping: true }]);

    for (let i = 0; i < words.length; i++) {
      currentText += words[i] + (i < words.length - 1 ? " " : "");
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...lastMsg, text: currentText }];
      });
      // Vitesse d'écriture (ajustable ici : 30ms par mot)
      await new Promise(res => setTimeout(res, 30));
    }
    
    // On marque l'écriture comme terminée
    setMessages(prev => {
      const lastMsg = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...lastMsg, isTyping: false }];
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isBotThinking) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsBotThinking(true);

    try {
      const apiHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiHistory })
      });
      
      const data = await res.json();
      setIsBotThinking(false);
      
      // On lance l'effet d'écriture type Gemini
      await typeText(data.text);

    } catch (err) {
      setIsBotThinking(false);
      setMessages(prev => [...prev, { role: "assistant", text: "❌ Erreur de connexion." }]);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") sendMessage(); };

  return (
    <div className="app">
      <div className="bg"></div>

      {!chatVisible ? (
        <div className="welcome fade-in">
          <div className="logo-container">
            <h1 className="logo">🌌 KAS UNIVERSE</h1>
            <div className="logo-glow"></div>
          </div>
          <p className="tagline">L'IA qui vous comprend vraiment.</p>
          <button className="start-btn" onClick={startChat}>Commencer</button>
        </div>
      ) : (
        <div className="chat-container fade-in">
          <div className="messages-area">
            {messages.map((m, i) => (
              <div key={i} className={`msg-row ${m.role}`}>
                <div className="avatar">{m.role === 'user' ? '👤' : '🌌'}</div>
                <div className="msg-content">
                  <div className="bubble">
                    {m.text.split("\n").map((line, idx) => <p key={idx}>{line}</p>)}
                  </div>
                </div>
              </div>
            ))}
            
            {isBotThinking && (
              <div className="msg-row assistant">
                <div className="avatar animate-spin">🌌</div>
                <div className="bubble thinking">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-wrapper">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Demandez n'importe quoi..."
                onKeyDown={handleKey}
              />
              <button className="send-btn" onClick={sendMessage} disabled={isBotThinking}>
                {isBotThinking ? "..." : "➤"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .app { height: 100dvh; background: #0a0a0c; color: #e4e4e7; font-family: 'Inter', system-ui, sans-serif; overflow: hidden; position: relative; }
        .bg { position: absolute; inset: 0; background: radial-gradient(circle at 50% -20%, #3b0a64 0%, transparent 50%), radial-gradient(circle at 0% 100%, #0f172a 0%, transparent 40%); z-index: 0; opacity: 0.6; }
        
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Welcome */
        .welcome { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
        .logo { font-size: 3rem; font-weight: 800; letter-spacing: -2px; background: linear-gradient(to right, #fff, #9333ea); -webkit-background-clip: text; color: transparent; margin: 0; }
        .tagline { opacity: 0.6; font-size: 1.1rem; }
        .start-btn { padding: 12px 32px; border-radius: 99px; border: none; background: #9333ea; color: white; font-weight: 600; cursor: pointer; transition: 0.3s; }
        .start-btn:hover { background: #a855f7; transform: scale(1.05); }

        /* Chat Layout (Stable like Gemini) */
        .chat-container { position: relative; z-index: 10; height: 100%; max-width: 850px; margin: 0 auto; display: flex; flex-direction: column; }
        .messages-area { flex: 1; overflow-y: auto; padding: 40px 20px; display: flex; flex-direction: column; gap: 32px; scrollbar-width: none; }
        .messages-area::-webkit-scrollbar { display: none; }

        .msg-row { display: flex; gap: 16px; width: 100%; }
        .msg-row.user { flex-direction: row-reverse; }
        .avatar { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        
        .bubble { max-width: 85%; line-height: 1.6; font-size: 1rem; }
        .user .bubble { background: #27272a; padding: 12px 20px; border-radius: 20px 20px 4px 20px; color: #fff; }
        .assistant .bubble { background: transparent; padding: 0; color: #d1d5db; }

        /* Thinking animation */
        .thinking { display: flex; gap: 4px; padding-top: 10px; }
        .dot { width: 6px; height: 6px; background: #9333ea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }

        /* Input Area */
        .input-area { padding: 20px; background: linear-gradient(to top, #0a0a0c 80%, transparent); }
        .input-wrapper { background: #18181b; border: 1px solid #27272a; border-radius: 28px; display: flex; align-items: center; padding: 6px 6px 6px 20px; transition: 0.2s; }
        .input-wrapper:focus-within { border-color: #9333ea; box-shadow: 0 0 0 1px #9333ea; }
        input { flex: 1; background: transparent; border: none; color: white; outline: none; font-size: 1rem; height: 44px; }
        .send-btn { width: 40px; height: 40px; border-radius: 50%; border: none; background: #9333ea; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .send-btn:disabled { background: #3f3f46; cursor: not-allowed; }

        @media (max-width: 640px) { .logo { font-size: 2rem; } .bubble { max-width: 90%; } }
      `}</style>
    </div>
  );
}
