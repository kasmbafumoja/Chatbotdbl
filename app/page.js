"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Kas Termux prêt. 🤖\nPose-moi tes questions.", isTyping: false }
  ]);
  const [input, setInput] = useState("");
  const [chatVisible, setChatVisible] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const startChat = () => setChatVisible(true);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotThinking]);

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
      await new Promise(res => setTimeout(res, 20));
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
      const apiHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.text }));
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
      setMessages(prev => [...prev, { role: "assistant", text: "⚠️ Erreur de connexion." }]);
    }
  };

  return (
    <div className="app-container">
      {!chatVisible ? (
        <div className="splash fade-in">
          <div className="logo-box">🤖</div>
          <h1>Kas Termux</h1>
          <button className="btn-start" onClick={startChat}>Lancer l'App</button>
        </div>
      ) : (
        <div className="mobile-chat">
          <header className="header">
            <span>Kas Termux</span>
            <div className="online-dot"></div>
          </header>

          <main className="chat-area">
            {messages.map((m, i) => (
              <div key={i} className={`row ${m.role}`}>
                <div className="avatar">{m.role === 'user' ? '👤' : '🤖'}</div>
                <div className="text-zone">{m.text}</div>
              </div>
            ))}
            {isBotThinking && (
              <div className="row assistant">
                <div className="avatar">🤖</div>
                <div className="loading-dots"><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <footer className="footer">
            <div className="input-pill">
              <input 
                type="text"
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Message..."
              />
              <button onClick={sendMessage} disabled={!input.trim()}>➤</button>
            </div>
          </footer>
        </div>
      )}

      <style jsx>{`
        .app-container { height: 100dvh; background: #ffffff; color: #202124; overflow: hidden; font-family: sans-serif; }
        
        /* Splash Screen */
        .splash { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
        .logo-box { font-size: 80px; }
        .btn-start { background: #1a73e8; color: white; border: none; padding: 15px 40px; border-radius: 30px; font-weight: bold; }

        /* Interface Gemini Mobile */
        .mobile-chat { display: flex; flex-direction: column; height: 100%; }
        .header { height: 60px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #f1f3f4; font-weight: bold; gap: 8px; }
        .online-dot { width: 8px; height: 8px; background: #34a853; border-radius: 50%; }

        .chat-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 30px; }
        .row { display: flex; gap: 15px; width: 100%; }
        .row.user { flex-direction: row-reverse; }
        .avatar { width: 35px; height: 35px; background: #f8f9fa; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .text-zone { flex: 1; line-height: 1.6; white-space: pre-wrap; font-size: 16px; }
        .user .text-zone { background: #f1f3f4; padding: 10px 15px; border-radius: 18px; max-width: 80%; flex: none; }

        .footer { padding: 15px; padding-bottom: calc(15px + env(safe-area-inset-bottom)); }
        .input-pill { background: #f1f3f4; border-radius: 30px; display: flex; align-items: center; padding: 5px 15px; }
        input { flex: 1; background: transparent; border: none; outline: none; height: 45px; font-size: 16px; }
        button { background: none; border: none; color: #1a73e8; font-size: 22px; cursor: pointer; }
        button:disabled { color: #bdc1c6; }

        .loading-dots { display: flex; gap: 4px; padding: 10px; }
        .loading-dots span { width: 6px; height: 6px; background: #1a73e8; border-radius: 50%; animation: blink 1.4s infinite; }
        @keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
