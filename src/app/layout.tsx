import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Providers from "@/components/Providers";
import AuthButton from "@/components/AuthButton";
import Sprint1StartLink from "@/components/Sprint1StartLink";
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
  title: "LARA — Learning & Relocation Assistant",
  description: "From curious to admitted, and fully relocated. One guided system for studying abroad.",
};

function LaraMark({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2.5" />
      <path d="M13 25 L20 11 L27 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21 H24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
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
              <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: "rgba(251,247,240,0.82)", borderBottom: "1px solid var(--hairline)" }}>
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2.5 group" style={{ color: "var(--ink)" }}>
                    <LaraMark className="w-7 h-7 transition-transform duration-300 group-hover:rotate-[-6deg]" />
                    <span className="font-extrabold text-xl tracking-tight">LARA</span>
                  </Link>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <Sprint1StartLink variant="primary" className="!px-5 !py-2.5 text-sm">
                      Start
                    </Sprint1StartLink>
                    <AuthButton />
                  </div>
                </div>
              </header>

              <main className="flex-grow">{children}</main>

              <footer style={{ borderTop: "1px solid var(--hairline)" }}>
                <div className="max-w-6xl mx-auto px-5 py-12">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex items-center gap-2.5" style={{ color: "var(--ink)" }}>
                      <LaraMark className="w-6 h-6" />
                      <span className="font-extrabold text-lg tracking-tight">LARA</span>
                    </div>
                    <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm" style={{ color: "var(--ink-soft)" }}>
                      <Link href="/intake" className="hover:opacity-70 transition-opacity">Get started</Link>
                      <a href="https://www.filipinas-abroad.com/" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity">About</a>
                      <Link href="/privacy" className="hover:opacity-70 transition-opacity">Privacy</Link>
                      <Link href="/terms" className="hover:opacity-70 transition-opacity">Terms</Link>
                      <a href="mailto:hello@filipinas-abroad.com" className="hover:opacity-70 transition-opacity">Contact</a>
                    </nav>
                  </div>
                  <p className="mt-8 text-xs" style={{ color: "var(--ink-faint)" }}>
                    © 2026 LARA EdTech · Powered by Filipinas Abroad
                  </p>
                </div>
              </footer>
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
