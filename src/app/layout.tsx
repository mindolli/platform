import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "과제 공유 플랫폼",
  description:
    "학생들을 위한 과제 공유 플랫폼. 과제를 업로드하고 다른 학생들의 과제를 열람하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">


        <Navbar />
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-card-border py-6 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-muted">
            <p>
              과제 공유 플랫폼
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
