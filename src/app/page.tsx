"use client";

import { useState, useEffect } from "react";

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

// Journey Visualization Component
const JOURNEY_STEPS = [
    {
      id: 1,
      title: "Apply to Programs",
      icon: "📝",
      description: "Discover and apply to your dream universities",
      color: "from-[#0D4A42] to-[#156558]"
    },
    {
      id: 2,
      title: "Get Accepted",
      icon: "🎓",
      description: "Receive your acceptance letter",
      color: "from-[#FFB800] to-[#E6A600]"
    },
    {
      id: 3,
      title: "Visa Preparation",
      icon: "✈️",
      description: "Complete visa documentation and requirements",
      color: "from-[#C75D3A] to-[#B04D2E]"
    },
    {
      id: 4,
      title: "Find Accommodation",
      icon: "🏠",
      description: "Secure your perfect place to live",
      color: "from-[#0D4A42] to-[#156558]"
    },
    {
      id: 5,
      title: "Residence Permit",
      icon: "✅",
      description: "Final step: Get your residence permit",
      color: "from-[#10B981] to-[#059669]"
    }
  ];

function JourneyVisualization() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % JOURNEY_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
        {JOURNEY_STEPS.map((step, index) => {
          const isActive = activeStep === index;
          const isPast = activeStep > index;
          
          return (
            <div
              key={step.id}
              className={`relative transition-all duration-1000 ${
                isActive ? "scale-110 z-10" : isPast ? "opacity-60" : "opacity-40"
              }`}
              style={{
                animation: isActive ? "pulse 2s infinite" : undefined
              }}
            >
              {/* Connecting Arrow (hidden on mobile) */}
              {index < JOURNEY_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 left-full w-full -translate-y-1/2 -z-10 pointer-events-none" style={{ paddingRight: '1rem' }}>
                  <div className="relative h-full flex items-center">
                    {/* Arrow Line */}
                    <div className={`flex-1 h-1 bg-gradient-to-r ${step.color} transition-all duration-1000 ${
                      isPast || isActive ? "opacity-100" : "opacity-20"
                    }`} style={{ marginRight: '0.5rem' }} />
                    {/* Arrow Head */}
                    <div 
                      className={`transition-all duration-1000 ${
                        isPast || isActive ? "opacity-100" : "opacity-20"
                      }`}
                      style={{
                        width: 0,
                        height: 0,
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderLeft: isPast || isActive 
                          ? (index === 0 ? '10px solid #0D4A42' : 
                             index === 1 ? '10px solid #FFB800' : 
                             index === 2 ? '10px solid #C75D3A' : 
                             index === 3 ? '10px solid #0D4A42' : 
                             '10px solid #10B981')
                          : '10px solid #9CA3AF'
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Step Card */}
              <div className={`premium-card text-center transition-all duration-500 ${
                isActive ? "shadow-[0_40px_80px_rgba(13,74,66,0.15)] border-[rgba(13,74,66,0.3)]" : ""
              }`}>
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-4xl shadow-lg transition-all duration-500 ${
                  isActive ? "scale-110 rotate-6" : ""
                }`}>
                  {step.icon}
                </div>
                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  isActive ? "text-[#0D4A42]" : "text-gray-400"
                }`}>
                  {step.title}
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isActive ? "text-gray-600" : "text-gray-400"
                }`}>
                  {step.description}
                </p>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFB800] rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress Indicator */}
      <div className="mt-8 flex justify-center gap-2">
        {JOURNEY_STEPS.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveStep(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeStep === index ? "w-8 bg-[#0D4A42]" : "bg-gray-300"
            }`}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Pricing Tiers Component
function PricingTiers() {
  const tiers = [
    {
      id: "trial",
      name: "Free Trial",
      price: "€0",
      period: "5 days",
      description: "Full access to all features",
      features: [
        "Complete profile setup",
        "Program discovery",
        "AI assistant access",
        "CV optimization (3 uses)",
        "Application tracking"
      ],
      cta: "Start Free Trial",
      popular: false,
      color: "border-gray-200"
    },
    {
      id: "starter",
      name: "Starter",
      price: "€199",
      period: "6 months",
      description: "Perfect for planning ahead",
      features: [
        "Everything in Free Trial",
        "Unlimited CV optimization",
        "Priority support",
        "Visa assistance",
        "Accommodation search"
      ],
      cta: "Choose Starter",
      popular: false,
      color: "border-[#0D4A42]/20"
    },
    {
      id: "monthly",
      name: "Monthly",
      price: "€49",
      period: "per month",
      description: "Flexible monthly access",
      features: [
        "Everything in Starter",
        "Cancel anytime",
        "Latest updates",
        "Community access",
        "Monthly check-ins"
      ],
      cta: "Start Monthly",
      popular: true,
      color: "border-[#FFB800]"
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "€700",
      period: "one-time",
      description: "Pay once, access forever",
      features: [
        "Everything in Monthly",
        "Lifetime updates",
        "Premium support",
        "Early access to features",
        "No recurring fees"
      ],
      cta: "Get Lifetime",
      popular: false,
      color: "border-[#C75D3A]"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className={`premium-card relative transition-all duration-500 ${
            tier.popular
              ? "border-2 border-[#FFB800] shadow-[0_40px_80px_rgba(255,184,0,0.15)] scale-105"
              : tier.color
          }`}
        >
          {tier.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FFB800] text-[#0D4A42] text-xs font-bold rounded-full">
              MOST POPULAR
            </div>
          )}
          
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[#0D4A42] mb-2">{tier.name}</h3>
            <div className="mb-2">
              <span className="text-4xl font-extrabold text-[#0D4A42]">{tier.price}</span>
              {tier.period && (
                <span className="text-gray-500 text-sm ml-2">/{tier.period}</span>
              )}
            </div>
            <p className="text-sm text-gray-500">{tier.description}</p>
          </div>
          
          <ul className="space-y-3 mb-8">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
          
          <button
            className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 ${
              tier.popular
                ? "bg-[#FFB800] text-[#0D4A42] hover:bg-[#E6A600] hover:shadow-lg"
                : tier.id === "trial"
                ? "bg-[#0D4A42] text-white hover:bg-[#156558] hover:shadow-lg"
                : "bg-white border-2 border-[#0D4A42] text-[#0D4A42] hover:bg-[#0D4A42] hover:text-white"
            }`}
          >
            {tier.cta}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center pt-20 md:pt-32 pb-20">
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
            Start Your Journey
          </a>
          <a href="/chat" className="btn-outline w-full sm:w-auto text-lg px-10">
            Talk to AI Assistant
          </a>
        </div>
        
        {/* Free Trial Badge */}
        <div className="mt-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-full">
            <span className="text-sm font-semibold text-[#0D4A42]">✨ 5-Day Free Trial</span>
            <span className="text-xs text-gray-500">No credit card required</span>
          </div>
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

      {/* Animated Journey Visualization */}
      <div className="w-full max-w-[1200px] px-6 mx-auto mt-20 md:mt-32 animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0D4A42] mb-4 tracking-tight">
            Your Complete Journey
          </h2>
          <p className="text-xl text-gray-500 max-w-[600px] mx-auto font-medium">
            From application to residence permit, we guide you every step of the way
          </p>
        </div>
        
        <JourneyVisualization />
      </div>

      {/* Pricing Section */}
      <div className="w-full max-w-[1200px] px-6 mx-auto mt-20 md:mt-32 animate-fade-in" style={{ animationDelay: "0.6s" }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0D4A42] mb-4 tracking-tight">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-500 max-w-[600px] mx-auto font-medium">
            Start with a free trial, then choose the plan that works for you
          </p>
        </div>
        
        <PricingTiers />
      </div>

      {/* Trust Indicator */}
      <div className="mt-20 md:mt-32 text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
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
