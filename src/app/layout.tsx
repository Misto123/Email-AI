import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: { default: "Email AI", template: "%s | Email AI" },
    description: "Human-approved AI email drafts for Purelymail inboxes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
