import { useState, useEffect } from 'react';
import { useAuction } from '../hooks/useAuction';

function Timer() {
  const { auctionInfo } = useAuction();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!auctionInfo) return;

    const timer = setInterval(() => {
      const remaining = Number(auctionInfo[6]); // timeRemaining from auctionInfo
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
    if (!started) return 'bg-yellow-500';
    if (active) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (!auctionInfo) return 'Loading...';
    
    const [started, cancelled, active] = auctionInfo;
    
    if (cancelled) return 'Cancelled';
    if (!started) return 'Not Started';
    if (active) return 'Active';
    return 'Ended';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Auction Status</h3>
      
      <div className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="font-medium">{getStatusText()}</span>
        </div>

        {/* Time Remaining */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-600">Time Remaining</div>
        </div>

        {/* Progress Bar */}
        {auctionInfo && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: timeLeft > 0 ? `${(timeLeft / (timeLeft + 1)) * 100}%` : '0%'
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timer;