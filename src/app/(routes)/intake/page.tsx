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
          className="w-full border-2 border-gray-200 rounded-lg p-4 text-lg text-gray-900 focus:border-blue-500 focus:outline-none" 
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
          className="w-full border-2 border-gray-200 rounded-lg p-4 text-lg text-gray-900 focus:border-blue-500 focus:outline-none" 
          placeholder="e.g., IN for India, US for United States" 
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
        <div className="space-y-3">
          <input 
            type="number" 
            className="w-full border-2 border-gray-200 rounded-lg p-4 text-lg text-gray-900 focus:border-blue-500 focus:outline-none" 
            placeholder="Minimum rent budget (€/month)" 
            value={form.rentBudgetMin}
            onChange={(e) => setForm({ ...form, rentBudgetMin: Number(e.target.value) })} 
          />
          <input 
            type="number" 
            className="w-full border-2 border-gray-200 rounded-lg p-4 text-lg text-gray-900 focus:border-blue-500 focus:outline-none" 
            placeholder="Maximum rent budget (€/month)" 
            value={form.rentBudgetMax}
            onChange={(e) => setForm({ ...form, rentBudgetMax: Number(e.target.value) })} 
          />
        </div>
      )
    },
    {
      id: 4,
      title: "What's your university budget?",
      subtitle: "This helps us find programs within your tuition range",
      input: (
        <div className="space-y-3">
          <input 
            type="number" 
            className="w-full border-2 border-gray-200 rounded-lg p-4 text-lg text-gray-900 focus:border-blue-500 focus:outline-none" 
            placeholder="Minimum university budget (€/year)" 
            value={form.universityBudgetMin}
            onChange={(e) => setForm({ ...form, universityBudgetMin: Number(e.target.value) })} 
          />
          <input 
            type="number" 
            className="w-full border-2 border-gray-200 rounded-lg p-4 text-lg text-gray-900 focus:border-blue-500 focus:outline-none" 
            placeholder="Maximum university budget (€/year)" 
            value={form.universityBudgetMax}
            onChange={(e) => setForm({ ...form, universityBudgetMax: Number(e.target.value) })} 
          />
        </div>
      )
    },
    {
      id: 5,
      title: "Which countries interest you?",
      subtitle: "We'll show you programs and accommodation in these places",
      input: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {["DE", "NL", "FR", "IT", "ES", "SE"].map(country => (
              <button
                key={country}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  form.targetCountries.includes(country) 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-900'
                }`}
                onClick={() => {
                  const newCountries = form.targetCountries.includes(country)
                    ? form.targetCountries.filter(c => c !== country)
                    : [...form.targetCountries, country];
                  setForm({ ...form, targetCountries: newCountries });
                }}
              >
                {country}
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
            { value: "BACHELORS", label: "Bachelor's Degree" },
            { value: "MASTERS", label: "Master's Degree" },
            { value: "PHD", label: "PhD" },
            { value: "DIPLOMA", label: "Diploma" }
          ].map(option => (
            <button
              key={option.value}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                form.degreeLevels.includes(option.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-900'
              }`}
              onClick={() => setForm({ ...form, degreeLevels: [option.value] })}
            >
              {option.label}
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
          className="w-full border-2 border-gray-200 rounded-lg p-4 text-lg text-gray-900 focus:border-blue-500 focus:outline-none" 
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">Step {step} of {questions.length}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 ml-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(step / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentQuestion.title}</h1>
          <p className="text-lg text-gray-600">{currentQuestion.subtitle}</p>
        </div>

        <div className="mb-8">
          {currentQuestion.input}
        </div>

        <div className="flex justify-between">
          <button 
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors" 
            onClick={back}
            disabled={step === 1}
          >
            {step > 1 ? "← Back" : ""}
          </button>
          
          <button 
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              canProceed() 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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


