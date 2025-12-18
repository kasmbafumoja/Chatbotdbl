export const metadata = {
  title: "Kas Universe GPT",
  description: "Un assistant IA humain et intelligent",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "Segoe UI, Arial, sans-serif", background: "#0b0f1a", color: "#fff", overflow: "hidden", height: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
