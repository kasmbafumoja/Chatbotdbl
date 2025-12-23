"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Bonjour ! Je suis Kas Termux 🤖. Comment puis-je t'aider aujourd'hui ?", isTyping: false }
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

  // Effet d'écriture progressive mot par mot (Style Gemini)
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
      await new Promise(res => setTimeout(res, 25)); // Vitesse fluide
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
      setMessages(prev => [...prev, { role: "assistant", text: "❌ Erreur de connexion au serveur." }]);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="gemini-app">
      {!chatVisible ? (
        <div className="welcome-screen">
          <h1 className="gemini-logo">Kas Termux</h1>
          <button className="start-chat-btn" onClick={startChat}>Commencer l'expérience</button>
        </div>
      ) : (
        <div className="chat-layout">
          {/* Zone des messages qui défile */}
          <div className="scroll-area">
            <div className="content-container">
              {messages.map((m, i) => (
                <div key={i} className={`gemini-row ${m.role}`}>
                  <div className="gemini-avatar">{m.role === 'user' ? '👤' : '🤖'}</div>
                  <div className="gemini-text">
                    <div className="message-bubble">
                      {m.text.split("\n").map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {isBotThinking && (
                <div className="gemini-row assistant">
                  <div className="gemini-avatar pulse-avatar">🤖</div>
                  <div className="gemini-text">
                    <div className="gemini-loader">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Barre de saisie immobile en bas (Exactement comme Gemini) */}
          <div className="input-fixed-container">
            <div className="input-inner">
              <div className="input-pill">
                <textarea
                  rows="1"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Écrivez ici..."
                  onKeyDown={handleKey}
                />
                <button className="send-icon" onClick={sendMessage} disabled={isBotThinking || !input.trim()}>
                  ➤
                </button>
              </div>
              <p className="disclaimer">Kas Termux peut faire des erreurs. Vérifiez les informations importantes.</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gemini-app { height: 100dvh; background: #ffffff; color: #1f1f1f; font-family: 'Google Sans', Arial, sans-serif; display: flex; flex-direction: column; }
        
        /* Accueil */
        .welcome-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #f8f9ff 0%, #ffffff 100%); }
        .gemini-logo { font-size: 3rem; font-weight: 500; background: linear-gradient(90deg, #4285f4, #9b72cb, #d96570); -webkit-background-clip: text; color: transparent; margin-bottom: 30px; }
        .start-chat-btn { padding: 12px 24px; border-radius: 20px; border: 1px solid #dadce0; background: white; cursor: pointer; font-size: 1rem; transition: 0.2s; }
        .start-chat-btn:hover { background: #f8f9ff; border-color: #4285f4; color: #4285f4; }

        /* Layout Chat */
        .chat-layout { display: flex; flex-direction: column; height: 100%; position: relative; }
        .scroll-area { flex: 1; overflow-y: auto; padding-top: 20px; padding-bottom: 180px; scrollbar-width: none; }
        .scroll-area::-webkit-scrollbar { display: none; }
        .content-container { max-width: 800px; margin: 0 auto; width: 100%; padding: 0 20px; }

        /* Lignes de messages */
        .gemini-row { display: flex; gap: 20px; margin-bottom: 40px; animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .gemini-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; background: #f0f2f5; flex-shrink: 0; }
        .pulse-avatar { animation: avatarBreath 2s infinite ease-in-out; }
        @keyframes avatarBreath { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } }

        .gemini-text { flex: 1; display: flex; flex-direction: column; }
        .message-bubble { line-height: 1.6; font-size: 1.05rem; }
        .user .message-bubble { background: #f0f2f5; padding: 12px 20px; border-radius: 18px; align-self: flex-end; max-width: 80%; }
        .assistant .message-bubble { background: transparent; color: #1f1f1f; }

        /* Zone de saisie fixe (Style Gemini) */
        .input-fixed-container { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, white 70%, transparent); padding: 20px 0 30px 0; }
        .input-inner { max-width: 800px; margin: 0 auto; padding: 0 20px; }
        .input-pill { background: #f0f2f5; border-radius: 32px; padding: 10px 20px; display: flex; align-items: center; gap: 10px; transition: 0.2s; border: 1px solid transparent; }
        .input-pill:focus-within { background: white; border-color: #dadce0; box-shadow: 0 1px 6px rgba(32,33,36,.28); }
        
        textarea { flex: 1; background: transparent; border: none; outline: none; resize: none; font-size: 1rem; color: #1f1f1f; font-family: inherit; padding: 10px 0; }
        .send-icon { background: none; border: none; color: #4285f4; cursor: pointer; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; }
        .send-icon:disabled { color: #c4c7c5; cursor: not-allowed; }
        
        .disclaimer { font-size: 0.75rem; text-align: center; color: #70757a; margin-top: 15px; }

        @media (max-width: 600px) { .gemini-row { gap: 10px; } .gemini-avatar { width: 32px; height: 32px; font-size: 1rem; } }
      `}</style>
    </div>
  );
}

