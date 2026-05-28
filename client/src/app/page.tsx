import React from 'react';
import InteractiveDotGrid from '../components/ui/InteractiveDotGrid';


export default function Home() {
  return (
    <>
      {/* Changed justify-between to justify-center, adjusted padding */}
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        
        <InteractiveDotGrid />

        {/* Added 'flex', changed to max-w-2xl, added -mt-32 for optical centering */}
        <div className="z-10 max-w-2xl w-full flex flex-col items-center justify-center font-mono text-sm -mt-32">
            
            <p className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
              Data Search (title wip)
            </p>
            
            <div className="flex items-center w-full px-5 py-3.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 hover:shadow-md focus-within:shadow-md transition-shadow">
          
              {/* SVG Search Icon */}
              <svg 
                className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* Input Field */}
              <input 
                type="text" 
                className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-200 text-base sm:text-lg"
                placeholder="Search datasets, metadata, and more..."
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button className="px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md text-sm text-gray-800 dark:text-gray-300 transition-colors">
                Search Data
              </button>
              <button className="px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md text-sm text-gray-800 dark:text-gray-300 transition-colors">
                Advanced Query
              </button>
            </div>

        </div>
      </main>
    </>
  );
}