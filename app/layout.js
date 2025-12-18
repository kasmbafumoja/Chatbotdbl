export const metadata = {
  title: "Human AI Assistant",
  description: "Un assistant IA humain, intelligent et bienveillant"
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
