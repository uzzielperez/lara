import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Providers from "@/components/Providers";
import AuthButton from "@/components/AuthButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
      <rect x="4" y="4" width="32" height="32" rx="8" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M8 20 C8 12 14 8 20 8 C26 8 32 12 32 20" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M20 18 L20 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 18 L14 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 18 L26 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 24 L32 24" stroke="currentColor" strokeWidth="2.5"/>
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
        <ErrorBoundary>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <nav className="sticky top-0 z-[100] bg-[rgba(253,248,243,0.8)] backdrop-blur-xl border-bottom border-[rgba(13,74,66,0.08)]">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2 group">
                    <FilipinasAbroadLogo className="w-8 h-8 text-[#C75D3A] transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-[#0D4A42] font-extrabold text-2xl tracking-tighter">Lara</span>
                  </Link>

                  <div className="hidden lg:flex items-center gap-8">
                    <Link href="/swipe" className="text-sm font-bold text-[#6B7280] hover:text-[#0D4A42] transition-colors">Programs</Link>
                    <Link href="/applications" className="text-sm font-bold text-[#6B7280] hover:text-[#0D4A42] transition-colors">Applications</Link>
                    <Link href="/accommodation" className="text-sm font-bold text-[#6B7280] hover:text-[#0D4A42] transition-colors">Housing</Link>
                    <Link href="/visa" className="text-sm font-bold text-[#6B7280] hover:text-[#0D4A42] transition-colors">Visa</Link>
                    <Link href="/cv" className="text-sm font-bold text-[#6B7280] hover:text-[#0D4A42] transition-colors">CV</Link>
                  </div>

                  <div className="flex items-center gap-4">
                    <Link href="/chat" className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#FFB800] text-[#1F2937] rounded-full font-bold text-sm hover:shadow-[0_10px_20px_rgba(255,184,0,0.15)] transition-all duration-300 hover:-translate-y-0.5">
                      <span className="text-lg">✨</span> AI Mentorship
                    </Link>
                    <div className="h-8 w-[1px] bg-[rgba(13,74,66,0.1)] hidden sm:block mx-2"></div>
                    <AuthButton />
                  </div>
                </div>
              </nav>

              <main className="flex-grow">
                {children}
              </main>

              <footer className="bg-[#0D4A42] text-white pt-24 pb-12 overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-0">
                  <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,184,0,0.05)_0%,transparent_70%)] blur-[100px]"></div>
                </div>

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center gap-2 mb-8">
                        <FilipinasAbroadLogo className="w-10 h-10 text-[#FFB800]" />
                        <span className="text-3xl font-extrabold tracking-tighter">Lara</span>
                      </div>
                      <p className="text-gray-400 max-w-sm text-lg font-medium leading-relaxed">
                        Empowering the next generation of global students through technology, mentorship, and opportunity.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-[#FFB800] font-bold uppercase tracking-widest text-xs mb-8">Platform</h4>
                      <ul className="space-y-4">
                        <li><Link href="/swipe" className="text-gray-400 hover:text-white transition-colors font-medium">University Search</Link></li>
                        <li><Link href="/visa" className="text-gray-400 hover:text-white transition-colors font-medium">Visa Pathways</Link></li>
                        <li><Link href="/accommodation" className="text-gray-400 hover:text-white transition-colors font-medium">Student Housing</Link></li>
                        <li><Link href="/chat" className="text-gray-400 hover:text-white transition-colors font-medium">AI Mentor</Link></li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[#FFB800] font-bold uppercase tracking-widest text-xs mb-8">Company</h4>
                      <ul className="space-y-4">
                        <li><a href="https://www.filipinas-abroad.com/" target="_blank" className="text-gray-400 hover:text-white transition-colors font-medium">About Us</a></li>
                        <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors font-medium">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors font-medium">Terms of Service</Link></li>
                        <li><a href="mailto:hello@filipinas-abroad.com" className="text-gray-400 hover:text-white transition-colors font-medium">Contact</a></li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-12 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">
                      © 2026 Filipinas Abroad. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                      {['TW', 'LI', 'IG'].map(social => (
                        <a key={social} href="#" className="text-gray-500 hover:text-white text-sm font-bold transition-colors">{social}</a>
                      ))}
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
