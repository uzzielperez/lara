// Filipinas Abroad Logo Component
function FilipinasAbroadLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Window/arch frame */}
      <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Arch top */}
      <path d="M8 20 C8 12 14 8 20 8 C26 8 32 12 32 20" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Sun rays */}
      <path d="M20 18 L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 18 L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 18 L26 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 18 L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 18 L28 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Horizon line */}
      <path d="M8 24 L32 24" stroke="currentColor" strokeWidth="2"/>
      {/* Ground lines */}
      <path d="M8 28 L32 28" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M8 32 L32 32" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
      {/* Filipinas Abroad Brand Header */}
      <div className="mb-8">
        <a 
          href="https://www.filipinas-abroad.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-6 py-3 bg-[#FDF8F3] border-2 border-[#C75D3A]/20 rounded-full hover:border-[#C75D3A]/40 transition-all duration-300"
        >
          <FilipinasAbroadLogo className="w-9 h-9 text-[#C75D3A]" />
          <span className="text-[#C75D3A] font-semibold text-xl">Filipinas Abroad</span>
        </a>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-teal mb-6 leading-tight">
          Your Journey to<br />
          <span className="text-gold-500">Study Abroad</span><br />
          Starts Here
        </h1>
        <p className="text-xl text-charcoal-light mb-8 max-w-2xl mx-auto">
          AI-powered guidance to help you find the perfect schools, prepare your visa, 
          and settle into your new life in Europe.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/intake" className="btn-accent text-lg">
            Get Started Free →
          </a>
          <a href="/chat" className="btn-outline text-lg">
            Talk to AI Assistant
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-4xl">
        <h2 className="text-center text-sm font-semibold text-charcoal-light uppercase tracking-wider mb-8">
          Everything you need for your study abroad journey
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/intake" className="card group cursor-pointer">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
              <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-teal mb-2">Build Your Profile</h3>
            <p className="text-charcoal-light">Complete your profile and let our AI match you with perfect programs</p>
          </a>
          
          <a href="/chat" className="card group cursor-pointer">
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold-200 transition-colors">
              <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-teal mb-2">AI Assistant</h3>
            <p className="text-charcoal-light">Chat with our AI to find schools, improve your CV, and get guidance</p>
          </a>
          
          <a href="/swipe" className="card group cursor-pointer">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
              <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-teal mb-2">Browse Programs</h3>
            <p className="text-charcoal-light">Discover study programs and universities across Europe</p>
          </a>
          
          <a href="/cv" className="card group cursor-pointer">
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold-200 transition-colors">
              <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-teal mb-2">CV Assistant</h3>
            <p className="text-charcoal-light">Upload your CV and get AI-powered improvements for applications</p>
          </a>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-cream-300 rounded-full">
          <span className="text-gold-500">★★★★★</span>
          <span className="text-charcoal-light text-sm">Empowering Filipinos to thrive abroad</span>
        </div>
      </div>
    </div>
  );
}
