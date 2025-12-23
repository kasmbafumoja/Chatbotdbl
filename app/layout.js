export const metadata = {
  title: "Kas Universe GPT",
  description: "Un assistant IA humain, intelligent et bienveillant",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* Tu peux ajouter ici un lien vers une police Google Fonts si tu veux changer le style */}
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#050505" }}>
        {children}
      </body>
    </html>
  );
}
