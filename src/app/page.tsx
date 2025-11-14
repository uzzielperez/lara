export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Study+Stay</h1>
        <p className="text-xl text-gray-600 mb-8">Your AI-powered study abroad assistant</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a 
            href="/intake" 
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-2">Get Started</h3>
            <p className="text-gray-600">Complete your profile to find the perfect programs</p>
          </a>
          
          <a 
            href="/chat" 
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
            <p className="text-gray-600">Chat with our AI to find schools, edit CV, and more</p>
          </a>
          
          <a 
            href="/swipe" 
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-2">Browse Programs</h3>
            <p className="text-gray-600">Discover study programs and universities</p>
          </a>
          
          <a 
            href="/cv" 
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-2">CV Assistant</h3>
            <p className="text-gray-600">Upload your CV and get AI-powered improvements</p>
          </a>
        </div>
        
        <div className="text-sm text-gray-500">
          Powered by Groq AI • Built with Next.js
        </div>
      </div>
    </div>
  );
}
