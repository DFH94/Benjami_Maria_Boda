import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Benjami & Maria",
  description: "Ens casem! Acompanya'ns en aquest dia tan especial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
