import { useState } from 'react';

interface CallControlsProps {
  onStartCall: () => void;
  onEndCall: () => void;
}

export default function CallControls({ onStartCall, onEndCall }: CallControlsProps) {
  const [isInCall, setIsInCall] = useState<boolean>(false);
  
  const handleStartCall = () => {
    onStartCall();
    setIsInCall(true);
  };
  
  const handleEndCall = () => {
    onEndCall();
    setIsInCall(false);
  };
  
  return (
    <div className="flex justify-center space-x-4 p-4 bg-gray-200 rounded-lg">
      {!isInCall ? (
        <button
          onClick={handleStartCall}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Démarrer l'appel
        </button>
      ) : (
        <button
          onClick={handleEndCall}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l-8 8m0-8l8 8" />
          </svg>
          Terminer l'appel
        </button>
      )}
    </div>
  );
}
