"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Bonjour ! Je suis Kas Universe 🤖. Prêt pour une discussion haute en couleurs ?", isTyping: false }
  ]);
  const [input, setInput] = useState("");
  const [chatVisible, setChatVisible] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const startChat = () => setChatVisible(true);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotThinking]);

  // Simulation d'écriture progressive (Style Gemini)
  const typeText = async (fullText) => {
    let currentText = "";
    const words = fullText.split(" ");
    
    setMessages(prev => [...prev.slice(0, -1), { role: "assistant", text: "", isTyping: true }]);

    for (let i = 0; i < words.length; i++) {
      currentText += words[i] + (i < words.length - 1 ? " " : "");
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...lastMsg, text: currentText }];
      });
      await new Promise(res => setTimeout(res, 40)); // Vitesse d'écriture
    }
    
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
      await typeText(data.text);

    } catch (err) {
      setIsBotThinking(false);
      setMessages(prev => [...prev, { role: "assistant", text: "❌ Oups ! Mon système a eu un petit bug." }]);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") sendMessage(); };

  return (
    <div className="app">
      <div className="animated-bg"></div>

      {!chatVisible ? (
        <div className="welcome fade-in">
          <h1 className="hero-title">🌌 KAS UNIVERSE</h1>
          <p className="hero-subtitle">L'intelligence artificielle aux couleurs de l'infini.</p>
          <button className="glow-button" onClick={startChat}>Lancer la connexion</button>
        </div>
      ) : (
        <div className="chat-interface fade-in">
          <div className="messages-scroll">
            {messages.map((m, i) => (
              <div key={i} className={`message-row ${m.role}`}>
                <div className="avatar-circle">
                  {m.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <span className="sender-name">{m.role === 'user' ? 'Vous' : 'Kas Universe'}</span>
                  <div className="bubble">
                    {m.text.split("\n").map((line, idx) => (
                      <p key={idx} className={m.role === 'assistant' ? 'rainbow-text' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {isBotThinking && (
              <div className="message-row assistant">
                <div className="avatar-circle pulse">🤖</div>
                <div className="bubble thinking-bubble">
                  <div className="loader-dots"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bottom-bar">
            <div className="input-box">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Écrivez votre message..."
                onKeyDown={handleKey}
              />
              <button className="send-btn" onClick={sendMessage} disabled={isBotThinking}>
                {isBotThinking ? '...' : '➤'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .app { height: 100dvh; background: #050508; color: #fff; font-family: 'Poppins', sans-serif; overflow: hidden; position: relative; }
        
        /* Arrière-plan animé */
        .animated-bg { position: absolute; inset: 0; background: 
          radial-gradient(circle at 20% 30%, #4f46e5 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, #9333ea 0%, transparent 40%);
          filter: blur(80px); opacity: 0.4; animation: pulseBg 10s infinite alternate; }
        @keyframes pulseBg { from { opacity: 0.3; } to { opacity: 0.6; } }

        .fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        /* Welcome Screen */
        .welcome { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; position: relative; text-align: center; padding: 20px; }
        .hero-title { font-size: 3.5rem; font-weight: 900; background: linear-gradient(90deg, #fff, #00d2ff, #9d50bb); -webkit-background-clip: text; color: transparent; margin-bottom: 10px; }
        .glow-button { padding: 15px 40px; border-radius: 50px; border: none; background: #fff; color: #000; font-weight: bold; cursor: pointer; box-shadow: 0 0 20px rgba(255,255,255,0.4); transition: 0.3s; }
        .glow-button:hover { transform: scale(1.1); box-shadow: 0 0 30px rgba(157, 80, 187, 0.6); }

        /* Chat Layout */
        .chat-interface { height: 100%; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; position: relative; z-index: 10; }
        .messages-scroll { flex: 1; overflow-y: auto; padding: 30px 20px; display: flex; flex-direction: column; gap: 25px; scrollbar-width: none; }
        .messages-scroll::-webkit-scrollbar { display: none; }

        .message-row { display: flex; gap: 12px; max-width: 85%; }
        .message-row.user { align-self: flex-end; flex-direction: row-reverse; }
        .message-row.assistant { align-self: flex-start; }

        .avatar-circle { width: 40px; height: 40px; background: #1f1f23; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; border: 1px solid rgba(255,255,255,0.1); }
        .pulse { animation: avatarPulse 2s infinite; }
        @keyframes avatarPulse { 0% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(147, 51, 234, 0); } 100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); } }

        .sender-name { font-size: 0.75rem; opacity: 0.5; margin-bottom: 4px; display: block; margin-left: 12px; }
        .user .sender-name { margin-left: 0; margin-right: 12px; text-align: right; }

        .bubble { padding: 12px 18px; border-radius: 20px; line-height: 1.5; font-size: 0.95rem; }
        .user .bubble { background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; border-bottom-right-radius: 4px; }
        .assistant .bubble { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-bottom-left-radius: 4px; }

        /* Texte multicolore pour le bot */
        .rainbow-text { background: linear-gradient(to right, #e0e0e0, #a5f3fc, #c4b5fd); -webkit-background-clip: text; color: transparent; display: inline; }

        /* Loader */
        .loader-dots { display: flex; gap: 4px; padding: 10px; }
        .loader-dots span { width: 8px; height: 8px; background: #9333ea; border-radius: 50%; animation: dotAnim 1.4s infinite; }
        .loader-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loader-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotAnim { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }

        /* Input Area */
        .bottom-bar { padding: 20px; background: linear-gradient(transparent, #050508); }
        .input-box { background: #111114; border: 1px solid rgba(255,255,255,0.1); border-radius: 30px; display: flex; align-items: center; padding: 8px 10px 8px 20px; }
        input { flex: 1; background: transparent; border: none; color: #fff; outline: none; height: 45px; }
        .send-btn { width: 45px; height: 45px; border-radius: 50%; border: none; background: #fff; color: #000; cursor: pointer; transition: 0.2s; font-weight: bold; }
        .send-btn:hover { transform: rotate(-15deg) scale(1.1); background: #00d2ff; }
        .send-btn:disabled { background: #333; color: #666; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
