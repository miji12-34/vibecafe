import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_KR } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

// 라틴 문자는 Geist, 한글은 Noto Sans KR (globals.css의 --font-sans에서 조합)
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const notoKr = Noto_Sans_KR({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-noto-kr", preload: false });

export const metadata: Metadata = {
  title: "느좋카페",
  description: "노트북 작업하기 좋은 카페를 지도에서 찾기",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable, notoKr.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
