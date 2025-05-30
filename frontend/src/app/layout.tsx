import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 八字算命 | 融合古老智慧與現代AI技術",
  description: "使用先進人工智慧技術分析八字命盤，提供準確的命理解讀與人生指引。結合傳統命理學與現代科技，為您揭示命運密碼。",
  keywords: ["八字", "算命", "AI", "人工智慧", "命理", "占卜", "命盤分析"],
  authors: [{ name: "AI Bazi Team" }],
  robots: "index, follow",
  openGraph: {
    title: "AI 八字算命",
    description: "融合古老智慧與現代AI技術的命理分析平台",
    type: "website",
    locale: "zh_TW",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased font-inter">
        {children}
      </body>
    </html>
  );
}
