import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Design Chameleon | AI-Powered Design System Extractor",
  description:
    "Extract complete design systems from any visual reference. Get CSS variables, Tailwind config, and shadcn/ui themes in seconds.",
  keywords: [
    "design system",
    "color palette",
    "CSS variables",
    "Tailwind CSS",
    "shadcn/ui",
    "AI design",
    "UI analysis",
  ],
  authors: [{ name: "Design Chameleon Team" }],
  openGraph: {
    title: "Design Chameleon | AI-Powered Design System Extractor",
    description:
      "Extract complete design systems from any visual reference in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased mesh-gradient min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
