// Filipinas Abroad Logo Component
function FilipinasAbroadLogo({ className = "w-8 h-8" }: { className?: string }) {
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

export default function Home() {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center pt-20 md:pt-32 pb-20 overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(circle,rgba(13,74,66,0.05)_0%,transparent_70%)] blur-[100px]"></div>
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,184,0,0.04)_0%,transparent_70%)] blur-[120px]"></div>
      </div>

      {/* Brand Badge */}
      <div className="animate-fade-in mb-10">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-[rgba(13,74,66,0.08)] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <FilipinasAbroadLogo className="w-6 h-6 text-[#C75D3A]" />
          <span className="text-[#0D4A42] font-bold text-sm tracking-tight">Filipinas Abroad Premium</span>
          <div className="w-1.5 h-1.5 bg-[#C75D3A] rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-[900px] px-6 mx-auto mb-20 animate-slide-up">
        <h1 className="section-heading mb-8">
          Your journey to study in <span className="text-[#C75D3A]">Europe</span> starts here.
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-[650px] mx-auto font-medium leading-relaxed">
          Expert AI-powered guidance to help you find the perfect schools, prepare your visa, and thrive in your new life.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <a href="/intake" className="btn-primary w-full sm:w-auto text-lg px-10">
            Build Your Profile
          </a>
          <a href="/chat" className="btn-outline w-full sm:w-auto text-lg px-10">
            Talk to AI Assistant
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-[1200px] px-6 mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a href="/intake" className="premium-card group">
            <div className="w-14 h-14 bg-[#FDF8F3] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0D4A42] group-hover:text-white transition-all duration-300">
              <svg className="w-7 h-7 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#0D4A42] mb-4 tracking-tight">Smart Profile</h3>
            <p className="text-gray-500 leading-relaxed font-medium">Custom roadmap based on your budget, nationality, and goals.</p>
          </a>
          
          <a href="/chat" className="premium-card group">
            <div className="w-14 h-14 bg-[#FDF8F3] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0D4A42] group-hover:text-white transition-all duration-300">
              <svg className="w-7 h-7 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#0D4A42] mb-4 tracking-tight">AI Assistant</h3>
            <p className="text-gray-500 leading-relaxed font-medium">Get instant answers about tuition, living costs, and admissions.</p>
          </a>
          
          <a href="/swipe" className="premium-card group">
            <div className="w-14 h-14 bg-[#FDF8F3] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0D4A42] group-hover:text-white transition-all duration-300">
              <svg className="w-7 h-7 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#0D4A42] mb-4 tracking-tight">Program Discovery</h3>
            <p className="text-gray-500 leading-relaxed font-medium">Swipe through verified universities and save your favorites.</p>
          </a>
          
          <a href="/cv" className="premium-card group">
            <div className="w-14 h-14 bg-[#FDF8F3] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0D4A42] group-hover:text-white transition-all duration-300">
              <svg className="w-7 h-7 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#0D4A42] mb-4 tracking-tight">CV Optimizer</h3>
            <p className="text-gray-500 leading-relaxed font-medium">AI-powered feedback to help you stand out to admissions officers.</p>
          </a>
        </div>
      </div>

      {/* Trust Indicator */}
      <div className="mt-32 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="flex -space-x-3 mb-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-cream-300 flex items-center justify-center text-xs font-bold text-[#0D4A42]">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-[#0D4A42] uppercase tracking-[0.2em]">Trusted by hundreds of Global Filipinos</p>
        </div>
      </div>
    </div>
  );
}
