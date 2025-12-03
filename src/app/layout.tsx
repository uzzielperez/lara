import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study+Stay | Your Study Abroad Journey",
  description: "AI-powered study abroad assistant for Filipinos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-teal text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-6">
            <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-gold-400">✦</span>
              Study+Stay
            </Link>
            <div className="hidden md:flex items-center gap-1 ml-auto">
              <Link href="/intake" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                Get Started
              </Link>
              <Link href="/profile" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                Profile
              </Link>
              <Link href="/swipe" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                Programs
              </Link>
              <Link href="/accommodation" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                Housing
              </Link>
              <Link href="/visa" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                Visa
              </Link>
              <Link href="/cv" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                CV
              </Link>
              <Link href="/chat" className="ml-2 px-4 py-2 text-sm font-medium bg-gold-500 text-charcoal-dark rounded-lg hover:bg-gold-400 transition-colors">
                AI Chat
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="bg-teal-dark text-white/80 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm">
            <p className="mb-2">Empowering Filipinos to study and thrive abroad</p>
            <p className="text-white/50">Powered by Groq AI • Built with Next.js</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
