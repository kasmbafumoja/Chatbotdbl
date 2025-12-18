export const metadata = {
  title: "AI Chat Bot",
  description: "ChatGPT & Gemini Assistant"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
