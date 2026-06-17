import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DataSearch — Find datasets in seconds",
  description:
    "Search millions of open datasets across science, government, and research. Powered by a modern semantic search engine.",
  keywords: ["dataset search", "open data", "data.gov", "CSV datasets", "research data"],
  openGraph: {
    title: "DataSearch",
    description: "Find datasets in seconds. Search millions of open datasets.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body className="dot-grid-bg min-h-screen antialiased">{children}</body>
    </html>
  );
}
