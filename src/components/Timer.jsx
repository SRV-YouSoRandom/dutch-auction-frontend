import { useState, useEffect } from 'react';
import { useAuction } from '../hooks/useAuction';

function Timer() {
  const { auctionInfo, isPaused } = useAuction(); // Added isPaused
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!auctionInfo) return;

    const timer = setInterval(() => {
      // Get the timeRemaining from auctionInfo (index 6)
      const remaining = Number(auctionInfo[6]);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionInfo]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    if (!auctionInfo) return 'bg-gray-500';
    
    const [started, cancelled, active] = auctionInfo;
    
    if (cancelled) return 'bg-red-500';
    if (isPaused) return 'bg-orange-500'; // Added pause state
    if (!started) return 'bg-yellow-500';
    if (active && !isPaused) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (!auctionInfo) return 'Loading...';
    
    const [started, cancelled, active] = auctionInfo;
    
    if (cancelled) return 'Cancelled';
    if (isPaused) return 'Paused'; // Added pause state
    if (!started) return 'Not Started';
    if (active && !isPaused) return 'Active';
    return 'Ended';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-600">Auction Status</h3>
      
      <div className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="font-medium text-gray-600">{getStatusText()}</span>
        </div>

        {/* Time Remaining */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-600">
            {isPaused ? 'Time Paused' : 'Time Remaining'}
          </div>
        </div>

        {/* Progress Bar */}
        {auctionInfo && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isPaused ? 'bg-orange-500' : 'bg-blue-600'
              }`}
              style={{ 
                width: timeLeft > 0 ? `${Math.max((timeLeft / (timeLeft + 1)) * 100, 5)}%` : '0%'
              }}
            ></div>
          </div>
        )}

        {/* Pause Notice */}
        {isPaused && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-orange-700">Auction is currently paused</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timer;