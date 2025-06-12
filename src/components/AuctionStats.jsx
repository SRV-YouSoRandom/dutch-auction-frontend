import { useAuction } from '../hooks/useAuction';

function AuctionStats() {
  const { 
    auctionInfo, 
    currentPrice, 
    maxTokensPerAddress, 
    minBidIncrement, 
    reservePrice, 
    startingPrice,
    totalTokenAmount,
    purchaseInfo,
    isPaused // Added isPaused
  } = useAuction();

  const getRemainingTokensFromRawCount = (maxAllowed, purchasedRaw) => {
    if (!maxAllowed || !purchasedRaw) return '0';
    const remaining = BigInt(maxAllowed) - (BigInt(purchasedRaw) * 10n ** 18n);
    return (remaining / 10n ** 18n).toString(); // convert back to whole tokens
  };

  const StatCard = ({ title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (!auctionInfo) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const [started, cancelled, active, , remaining, sold, , totalBuyers] = auctionInfo;
  
  // Fixed calculations - sold is already in token format, totalTokenAmount is in wei
  const totalTokensFormatted = BigInt(totalTokenAmount) / 10n ** 18n;
  const soldTokens = BigInt(sold);
  const remainingTokens = totalTokensFormatted - soldTokens;
  
  const remainingTokensFormatted = remainingTokens.toLocaleString();
  const soldPercentage = totalTokensFormatted > 0n ? 
    ((Number(soldTokens) / Number(totalTokensFormatted)) * 100).toFixed(4)
    : '0.00';

  console.log(totalTokensFormatted,soldTokens,soldPercentage)
  
  console.log('Debug info:', {
    totalTokenAmount,
    remaining,
    sold,
    soldPercentage,
    remainingTokensFormatted
  });

  // Updated status logic to include pause state
  const getAuctionStatus = () => {
    if (cancelled) return { text: 'Cancelled', color: 'text-red-600' };
    if (isPaused) return { text: 'Paused', color: 'text-orange-600' };
    if (active && !isPaused) return { text: 'Active', color: 'text-green-600' };
    if (started) return { text: 'Ended', color: 'text-gray-600' };
    return { text: 'Not Started', color: 'text-yellow-600' };
  };

  const status = getAuctionStatus();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Auction Overview</h2>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Current Price" 
            value={`${Number(currentPrice).toFixed(4)} JUNE`}
            color="green"
          />
          <StatCard 
            title="Tokens Remaining" 
            value={remainingTokensFormatted}
            subtitle={`${soldPercentage}% sold`}
            color="blue"
          />
          <StatCard 
            title="Total Buyers" 
            value={totalBuyers?.toString() || '0'}
            color="purple"
          />
        </div>

        {/* Progress Bar for Token Sales */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Tokens Sold</span>
            <span>{soldPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${soldPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 tokens</span>
            <span>{(Number(totalTokenAmount) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })} tokens</span>
          </div>
        </div>

        {/* Pause Notice */}
        {isPaused && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-orange-800">Auction Paused</p>
                <p className="text-sm text-orange-600">Token purchases are temporarily disabled.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auction Parameters - Fixed text colors */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Auction Parameters</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Starting Price:</span>
              <span className="font-medium text-gray-900">{Number(startingPrice).toFixed(4)} JUNE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reserve Price:</span>
              <span className="font-medium text-gray-900">{Number(reservePrice).toFixed(4)} JUNE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Min Bid Increment:</span>
              <span className="font-medium text-gray-900">{Number(minBidIncrement).toFixed(4)} JUNE</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Max Tokens/Address:</span>
              <span className="font-medium text-gray-900">{(Number(maxTokensPerAddress) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Token Supply:</span>
              <span className="font-medium text-gray-900">{(Number(totalTokenAmount) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Auction Status:</span>
              <span className={`font-medium ${status.color}`}>
                {status.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Purchase Info */}
      {purchaseInfo && Number(purchaseInfo[0]) > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Your Purchases</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{purchaseInfo[0]?.toString()}</div>
              <div className="text-sm text-gray-600">Tokens Purchased</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {purchaseInfo[1] ? (Number(purchaseInfo[1]) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 }) : 0} JUNE
              </div>
              <div className="text-sm text-gray-600">Total Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {purchaseInfo ? getRemainingTokensFromRawCount(maxTokensPerAddress, purchaseInfo[0]) : '0'}
              </div>
              <div className="text-sm text-gray-600">Remaining Allowance</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuctionStats;