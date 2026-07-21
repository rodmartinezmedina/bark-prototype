import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const gordita = localFont({
  src: [
    { path: "./fonts/Gordita-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/Gordita-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Gordita-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/Gordita-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/Gordita-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-gordita",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bark — Seller List Redesign",
  description: "Interactive prototype: seller list with working filters and AI match summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${gordita.variable} h-full antialiased`}>
      <body className={`${gordita.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
