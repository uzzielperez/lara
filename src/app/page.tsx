"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  { id: 1, title: "Apply to Programs", icon: "📝", description: "Discover and apply to your dream universities", color: "from-green-500 to-green-600", link: "/swipe" },
  { id: 2, title: "Get Accepted", icon: "🎓", description: "Receive your acceptance letter", color: "from-yellow-400 to-yellow-500", link: "/applications" },
  { id: 3, title: "Visa Preparation", icon: "✈️", description: "Complete visa documentation", color: "from-orange-500 to-orange-600", link: "/visa" },
  { id: 4, title: "Find Accommodation", icon: "🏠", description: "Secure your perfect place to live", color: "from-teal-500 to-teal-600", link: "/accommodation" },
  { id: 5, title: "Residence Permit", icon: "✅", description: "Get your residence permit", color: "from-green-600 to-green-700", link: "/applications" }
];

function SimpleJourneyCards() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % JOURNEY_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6">
      {/* Clean Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {JOURNEY_STEPS.map((step, index) => {
          const isActive = activeStep === index;
          const isPast = activeStep > index;

          return (
            <Link key={step.id} href={step.link} className="block">
              <div
                className={`premium-card text-center transition-all duration-300 cursor-pointer hover:scale-105 ${
                  isActive
                    ? "border-2 border-[#0D4A42] shadow-lg scale-105"
                    : isPast
                    ? "border-2 border-[#10B981]"
                    : "border border-gray-200"
                }`}
              >
                {/* Step Number */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isPast
                        ? "bg-[#10B981] text-white"
                        : isActive
                        ? `bg-gradient-to-br ${step.color} text-white`
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isPast ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < JOURNEY_STEPS.length - 1 && (
                    <div className="hidden md:block flex-1 h-0.5 bg-gray-200"></div>
                  )}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 ${
                    isPast
                      ? "bg-[#10B981]"
                      : isActive
                      ? `bg-gradient-to-br ${step.color} scale-110`
                      : "bg-gray-100"
                  }`}
                >
                  <span>{step.icon}</span>
                </div>

                {/* Title */}
                <h3
                  className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isActive ? "text-[#0D4A42]" : isPast ? "text-[#10B981]" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Progress Dots */}
      <div className="mt-8 flex justify-center gap-2">
        {JOURNEY_STEPS.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveStep(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              activeStep === index
                ? "w-8 bg-[#0D4A42]"
                : activeStep > index
                ? "w-6 bg-[#10B981]"
                : "w-2 bg-gray-300"
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

      {/* Journey Visualization - Replaces Features Grid */}
      <div className="w-full max-w-[1200px] px-6 mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <SimpleJourneyCards />
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
