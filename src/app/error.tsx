'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Phoenix AI Resume Builder Error:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-black text-white">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-black"></div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-lg mx-auto text-center space-y-8">
            
            {/* Phoenix logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-orange-400/30">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full blur-xl opacity-40 animate-pulse"></div>
              </div>
            </div>

            {/* Phoenix branding */}
            <div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                PHOENIX
              </h1>
              <p className="text-gray-300 text-lg tracking-wide">AI RESUME BUILDER</p>
            </div>

            {/* Error message */}
            <div className="bg-black/40 backdrop-blur-sm border border-orange-500/20 rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                We encountered an unexpected error while building your resume. 
                Our AI is working to resolve this issue.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => reset()}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Try Again
                </button>
                
                <a
                  href="/"
                  className="px-8 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/20"
                >
                  Go Home
                </a>
              </div>
            </div>

            {/* Support note */}
            <p className="text-gray-400 text-sm">
              Need help? Contact our support team if this error continues.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}