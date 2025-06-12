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
    purchaseInfo 
  } = useAuction();

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
  const soldPercentage = totalTokenAmount > 0 ? ((Number(sold) / Number(totalTokenAmount)) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Auction Overview</h2>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Current Price" 
            value={`${Number(currentPrice).toFixed(4)} ETH`}
            color="green"
          />
          <StatCard 
            title="Tokens Remaining" 
            value={remaining?.toString() || '0'}
            subtitle={`${soldPercentage}% sold`}
            color="blue"
          />
          <StatCard 
            title="Total Buyers" 
            value={totalBuyers?.toString() || '0'}
            color="purple"
          />
          <StatCard 
            title="Your Tokens" 
            value={purchaseInfo ? purchaseInfo[0]?.toString() || '0' : '0'}
            subtitle={purchaseInfo ? `${Number(purchaseInfo[2]) || 0} remaining` : ''}
            color="indigo"
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
            <span>{totalTokenAmount} tokens</span>
          </div>
        </div>
      </div>

      {/* Auction Parameters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Auction Parameters</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Starting Price:</span>
              <span className="font-medium">{Number(startingPrice).toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reserve Price:</span>
              <span className="font-medium">{Number(reservePrice).toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Min Bid Increment:</span>
              <span className="font-medium">{Number(minBidIncrement).toFixed(4)} ETH</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Max Tokens/Address:</span>
              <span className="font-medium">{maxTokensPerAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Token Supply:</span>
              <span className="font-medium">{totalTokenAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Auction Status:</span>
              <span className={`font-medium ${
                cancelled ? 'text-red-600' : 
                active ? 'text-green-600' : 
                started ? 'text-gray-600' : 'text-yellow-600'
              }`}>
                {cancelled ? 'Cancelled' : active ? 'Active' : started ? 'Ended' : 'Not Started'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Purchase Info */}
      {purchaseInfo && Number(purchaseInfo[0]) > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Your Purchases</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{purchaseInfo[0]?.toString()}</div>
              <div className="text-sm text-gray-600">Tokens Purchased</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {purchaseInfo[1] ? Number(purchaseInfo[1]) / 1e18 : 0} ETH
              </div>
              <div className="text-sm text-gray-600">Total Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{purchaseInfo[2]?.toString()}</div>
              <div className="text-sm text-gray-600">Remaining Allowance</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuctionStats;