"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Salut ! Kas Termux prêt à l'action. 🤖", isTyping: false }
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

  // Effet d'écriture progressive
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
      await new Promise(res => setTimeout(res, 35));
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
      setMessages(prev => [...prev, { role: "assistant", text: "❌ Erreur réseau." }]);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") sendMessage(); };

  return (
    <div className="app">
      <div className="soft-bg"></div>

      {!chatVisible ? (
        <div className="welcome fade-in">
          <h1 className="title">KAS TERMUX 🤖</h1>
          <p className="subtitle">L'IA rapide, claire et efficace.</p>
          <button className="main-btn" onClick={startChat}>Ouvrir le terminal</button>
        </div>
      ) : (
        <div className="chat-box fade-in">
          <header className="top-nav">
            <span className="status">● En ligne</span>
          </header>

          <div className="message-list">
            {messages.map((m, i) => (
              <div key={i} className={`msg-group ${m.role}`}>
                <div className="icon">{m.role === 'user' ? '👤' : '🤖'}</div>
                <div className="bubble">
                  {m.text.split("\n").map((line, idx) => (
                    <p key={idx} className={m.role === 'assistant' ? 'text-bot' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            
            {isBotThinking && (
              <div className="msg-group assistant">
                <div className="icon loading">🤖</div>
                <div className="bubble thinking">
                  <div className="dots"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-zone">
            <div className="bar">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Tape ton message ici..."
                onKeyDown={handleKey}
              />
              <button className="send" onClick={sendMessage} disabled={isBotThinking}>➤</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .app { height: 100dvh; background: #f4f7fb; color: #333; font-family: 'Segoe UI', sans-serif; overflow: hidden; position: relative; }
        
        .soft-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); z-index: 0; }

        .fade-in { animation: fadeIn 0.4s ease-out forwards; z-index: 10; position: relative; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Accueil */
        .welcome { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
        .title { font-size: 2.5rem; color: #4f46e5; margin-bottom: 10px; font-weight: 800; }
        .main-btn { padding: 14px 40px; border-radius: 12px; border: none; background: #4f46e5; color: white; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 1.1rem; }
        .main-btn:hover { background: #4338ca; transform: scale(1.05); }

        /* Chat */
        .chat-box { height: 100%; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; background: white; box-shadow: 0 10px 50px rgba(0,0,0,0.05); }
        .top-nav { padding: 15px; border-bottom: 1px solid #eee; text-align: center; }
        .status { color: #10b981; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }

        .message-list { flex: 1; overflow-y: auto; padding: 25px; display: flex; flex-direction: column; gap: 20px; }
        .msg-group { display: flex; gap: 12px; max-width: 85%; align-items: flex-end; }
        .msg-group.user { align-self: flex-end; flex-direction: row-reverse; }
        
        .icon { width: 35px; height: 35px; background: #f0f2f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        .loading { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .bubble { padding: 12px 18px; border-radius: 18px; font-size: 1rem; line-height: 1.5; }
        .user .bubble { background: #4f46e5; color: white; border-bottom-right-radius: 4px; }
        .assistant .bubble { background: #f0f2f5; color: #1f2937; border-bottom-left-radius: 4px; }

        /* Texte multicolore discret pour le bot */
        .text-bot { background: linear-gradient(90deg, #1f2937, #4f46e5); -webkit-background-clip: text; color: transparent; font-weight: 500; }

        /* Loader dots */
        .dots { display: flex; gap: 4px; padding: 5px; }
        .dots span { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: blink 1.4s infinite; }
        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

        /* Input Zone */
        .input-zone { padding: 20px; border-top: 1px solid #eee; background: white; }
        .bar { display: flex; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 6px 10px 6px 18px; align-items: center; }
        input { flex: 1; background: transparent; border: none; outline: none; height: 40px; font-size: 1rem; color: #333; }
        .send { background: #4f46e5; color: white; border: none; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
        .send:hover { background: #4338ca; transform: scale(1.1); }
        .send:disabled { background: #ccc; }

        @media (max-width: 480px) { .chat-box { max-width: 100%; } .bubble { max-width: 90%; } }
      `}</style>
    </div>
  );
}
