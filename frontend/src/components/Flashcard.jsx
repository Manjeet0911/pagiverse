import React, { useState } from 'react';

const Flashcard = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-48 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`w-full h-full duration-500 transform-style-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front side (Question) */}
        <div className="absolute w-full h-full backface-hidden bg-white border-2 border-blue-200 rounded-xl shadow-sm p-4 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Question</span>
          <p className="text-lg font-medium text-gray-800">{question}</p>
          <div className="absolute bottom-3 text-xs text-gray-400">Click to flip ⤵</div>
        </div>

        {/* Back side (Answer) */}
        <div className="absolute w-full h-full backface-hidden bg-blue-50 border-2 border-blue-500 rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center rotate-y-180">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Answer</span>
          <p className="text-md text-gray-700 overflow-y-auto">{answer}</p>
        </div>

      </div>
    </div>
  );
};

export default Flashcard;