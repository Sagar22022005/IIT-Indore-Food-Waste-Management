import { Link } from 'react-router-dom'

export default function Welcome() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/dining.png" 
          alt="IIT Indore Campus" 
          className="w-full h-full object-cover" 
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-pink-900/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between p-6">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-6 py-2.5 bg-white/20 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-4xl w-full text-center">
            {/* Main Title */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 drop-shadow-2xl">
                <span className="bg-gradient-to-r from-yellow-300 via-white to-cyan-300 bg-clip-text text-transparent">
                  IIT INDORE
                </span>
              </h1>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-xl">
                Food Waste Management
              </h2>
              <h3 className="text-xl md:text-2xl font-semibold text-blue-200 mb-6 drop-shadow-lg">
                Web Application
              </h3>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <span className="px-4 py-2 bg-green-500/80 backdrop-blur-sm text-white rounded-full text-sm font-semibold shadow-lg">
                🌱 Sustainability
              </span>
              <span className="px-4 py-2 bg-blue-500/80 backdrop-blur-sm text-white rounded-full text-sm font-semibold shadow-lg">
                🏛️ IIT Indore
              </span>
              <span className="px-4 py-2 bg-yellow-500/80 backdrop-blur-sm text-white rounded-full text-sm font-semibold shadow-lg">
                🍽️ Smart Mess
              </span>
            </div>

            {/* Please Login Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20 max-w-2xl mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Please Login
                </h3>
                <p className="text-gray-600 mb-6">
                  Access your dashboard to manage food waste and provide feedback
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Sign Up
                </Link>
              </div>

              {/* Features */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Track Waste</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>Improve Quality</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Greener Campus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


