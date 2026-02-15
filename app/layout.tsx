import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import AntigravityBackground from "./components/AntigravityBackground";

export const metadata = {
  title: "Akademik IC Gowa",
  description: "Selamat Datang di Laman Akademik MAN Insan Cendekia Gowa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AntigravityBackground />
        {children}
      </body>
    </html>
  );
}