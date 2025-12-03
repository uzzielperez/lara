"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    nationalityCode: "",
    rentBudgetMin: 500,
    rentBudgetMax: 1200,
    universityBudgetMin: 0,
    universityBudgetMax: 20000,
    targetCountries: ["DE", "NL"],
    degreeLevels: ["MASTERS"],
    desiredStart: "",
  });

  const questions = [
    {
      id: 1,
      title: "Hi there! 👋 What's your name?",
      subtitle: "We'd love to get to know you better",
      input: (
        <input 
          className="input-field text-lg" 
          placeholder="Enter your full name" 
          value={form.name} 
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
        />
      )
    },
    {
      id: 2,
      title: "What's your nationality?",
      subtitle: "This helps us show you the right visa requirements",
      input: (
        <input 
          className="input-field text-lg" 
          placeholder="e.g., PH for Philippines, IN for India" 
          value={form.nationalityCode} 
          onChange={(e) => setForm({ ...form, nationalityCode: e.target.value.toUpperCase() })} 
        />
      )
    },
    {
      id: 3,
      title: "What's your monthly rent budget?",
      subtitle: "This helps us find accommodation within your range",
      input: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-charcoal-light mb-1 block">Minimum (€/month)</label>
            <input 
              type="number" 
              className="input-field text-lg" 
              placeholder="500" 
              value={form.rentBudgetMin}
              onChange={(e) => setForm({ ...form, rentBudgetMin: Number(e.target.value) })} 
            />
          </div>
          <div>
            <label className="text-sm text-charcoal-light mb-1 block">Maximum (€/month)</label>
            <input 
              type="number" 
              className="input-field text-lg" 
              placeholder="1200" 
              value={form.rentBudgetMax}
              onChange={(e) => setForm({ ...form, rentBudgetMax: Number(e.target.value) })} 
            />
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "What's your university budget?",
      subtitle: "This helps us find programs within your tuition range",
      input: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-charcoal-light mb-1 block">Minimum (€/year)</label>
            <input 
              type="number" 
              className="input-field text-lg" 
              placeholder="0" 
              value={form.universityBudgetMin}
              onChange={(e) => setForm({ ...form, universityBudgetMin: Number(e.target.value) })} 
            />
          </div>
          <div>
            <label className="text-sm text-charcoal-light mb-1 block">Maximum (€/year)</label>
            <input 
              type="number" 
              className="input-field text-lg" 
              placeholder="20000" 
              value={form.universityBudgetMax}
              onChange={(e) => setForm({ ...form, universityBudgetMax: Number(e.target.value) })} 
            />
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Which countries interest you?",
      subtitle: "We'll show you programs and accommodation in these places",
      input: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { code: "DE", name: "🇩🇪 Germany" },
              { code: "NL", name: "🇳🇱 Netherlands" },
              { code: "FR", name: "🇫🇷 France" },
              { code: "IT", name: "🇮🇹 Italy" },
              { code: "ES", name: "🇪🇸 Spain" },
              { code: "SE", name: "🇸🇪 Sweden" },
            ].map(country => (
              <button
                key={country.code}
                type="button"
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  form.targetCountries.includes(country.code) 
                    ? 'border-teal bg-primary-50 text-teal shadow-sm' 
                    : 'border-cream-400 hover:border-primary-300 text-charcoal bg-white'
                }`}
                onClick={() => {
                  const newCountries = form.targetCountries.includes(country.code)
                    ? form.targetCountries.filter(c => c !== country.code)
                    : [...form.targetCountries, country.code];
                  setForm({ ...form, targetCountries: newCountries });
                }}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "What degree level are you looking for?",
      subtitle: "This helps us match you with the right programs",
      input: (
        <div className="space-y-3">
          {[
            { value: "BACHELORS", label: "Bachelor's Degree", icon: "🎓" },
            { value: "MASTERS", label: "Master's Degree", icon: "📚" },
            { value: "PHD", label: "PhD", icon: "🔬" },
            { value: "DIPLOMA", label: "Diploma", icon: "📜" }
          ].map(option => (
            <button
              key={option.value}
              type="button"
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${
                form.degreeLevels.includes(option.value)
                  ? 'border-teal bg-primary-50 text-teal shadow-sm' 
                  : 'border-cream-400 hover:border-primary-300 text-charcoal bg-white'
              }`}
              onClick={() => setForm({ ...form, degreeLevels: [option.value] })}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      id: 7,
      title: "When would you like to start?",
      subtitle: "This helps us show you programs with the right deadlines",
      input: (
        <input 
          className="input-field text-lg" 
          type="date" 
          value={form.desiredStart} 
          onChange={(e) => setForm({ ...form, desiredStart: e.target.value })} 
        />
      )
    }
  ];

  const currentQuestion = questions[step - 1];

  function next() {
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      // Save form data to localStorage and redirect to profile
      localStorage.setItem('userProfile', JSON.stringify(form));
      router.push("/profile");
    }
  }

  function back() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  const canProceed = () => {
    switch(step) {
      case 1: return form.name.trim() !== "";
      case 2: return form.nationalityCode.trim() !== "";
      case 3: return form.rentBudgetMin > 0 && form.rentBudgetMax > form.rentBudgetMin;
      case 4: return form.universityBudgetMin >= 0 && form.universityBudgetMax >= form.universityBudgetMin;
      case 5: return form.targetCountries.length > 0;
      case 6: return form.degreeLevels.length > 0;
      case 7: return form.desiredStart !== "";
      default: return false;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg border border-cream-300 p-8 w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-charcoal-light">Step {step} of {questions.length}</span>
            <span className="text-sm text-gold-600 font-medium">{Math.round((step / questions.length) * 100)}% complete</span>
          </div>
          <div className="w-full bg-cream-300 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-teal to-primary-500 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${(step / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal mb-3">{currentQuestion.title}</h1>
          <p className="text-lg text-charcoal-light">{currentQuestion.subtitle}</p>
        </div>

        {/* Input */}
        <div className="mb-8">
          {currentQuestion.input}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button 
            className="px-5 py-2.5 text-charcoal-light hover:text-teal transition-colors font-medium" 
            onClick={back}
            disabled={step === 1}
          >
            {step > 1 ? "← Back" : ""}
          </button>
          
          <button 
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              canProceed() 
                ? 'btn-accent shadow-md hover:shadow-lg' 
                : 'bg-cream-300 text-charcoal-light/50 cursor-not-allowed'
            }`}
            onClick={next}
            disabled={!canProceed()}
          >
            {step === questions.length ? "Start Exploring →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
