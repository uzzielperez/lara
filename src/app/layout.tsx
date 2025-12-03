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
  title: "Filipinas Abroad | Study+Stay",
  description: "AI-powered study abroad assistant for Filipinas Abroad clients",
};

// Filipinas Abroad Logo Component
function FilipinasAbroadLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 20 C8 12 14 8 20 8 C26 8 32 12 32 20" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M20 18 L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 18 L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 18 L26 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 18 L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 18 L28 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 24 L32 24" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 28 L32 28" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M8 32 L32 32" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  );
}

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
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FDF8F3] rounded-full">
                <FilipinasAbroadLogo className="w-6 h-6 text-[#C75D3A]" />
                <span className="text-[#C75D3A] font-semibold text-sm">Filipinas Abroad</span>
              </div>
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
          <div className="max-w-6xl mx-auto px-4 py-10">
            {/* Filipinas Abroad Brand */}
            <div className="flex flex-col items-center mb-6">
              <a 
                href="https://www.filipinas-abroad.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-2.5 bg-[#FDF8F3] rounded-full hover:shadow-lg transition-all duration-300"
              >
                <FilipinasAbroadLogo className="w-7 h-7 text-[#C75D3A]" />
                <span className="text-[#C75D3A] font-semibold">Filipinas Abroad</span>
              </a>
            </div>
            
            {/* Footer Content */}
            <div className="text-center text-sm">
              <p className="mb-2">Empowering Filipinos to study and thrive abroad</p>
              <p className="text-white/50">Powered by Groq AI • Built with Next.js</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
