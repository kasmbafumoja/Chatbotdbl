export const metadata = {
  title: "TERMUX IA",
  description: "L'intelligence artificielle rapide et efficace",
  // Cette ligne est cruciale pour le mobile (empêche le zoom et stabilise l'APK)
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* Ligne du Manifest demandée par Progressier */}
        <link rel="manifest" href="https://progressier.app/M0Wr8VahXVrPaIAnYEHM/progressier.json"/>
        
        {/* Script de l'application demandé par Progressier */}
        <script defer src="https://progressier.app/M0Wr8VahXVrPaIAnYEHM/script.js"></script>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#ffffff" }}>
        {children}
      </body>
    </html>
  );
}
