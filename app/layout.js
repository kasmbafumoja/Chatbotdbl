"use client"; // <-- important pour le CSS

export const metadata = {
  title: "Kas Universe GPT",
  description: "Un assistant IA humain et intelligent"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "Segoe UI, Arial, sans-serif", background: "#0b0f1a", color: "#fff", overflow: "hidden", height: "100vh" }}>
        {children}

        {/* ===== ANIMATIONS GLOBALES ===== */}
        <style jsx global>{`
          @keyframes moveBg {
            0% { transform: translate(-30%, -30%); }
            50% { transform: translate(-10%, -10%); }
            100% { transform: translate(-30%, -30%); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes glow {
            from { text-shadow: 0 0 10px #7f00ff; }
            to   { text-shadow: 0 0 30px #00e5ff; }
          }
        `}</style>
      </body>
    </html>
  );
}
