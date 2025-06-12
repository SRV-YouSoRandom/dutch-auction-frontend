import { useState } from 'react';
import { useAuction } from '../hooks/useAuction';

function BuyTokens() {
  const [tokenAmount, setTokenAmount] = useState('');
  const [overpay, setOverpay] = useState('');
  
  const { 
    auctionInfo, 
    currentPrice, 
    buyTokens, 
    isBuying, 
    calculateCost,
    purchaseInfo,
    maxTokensPerAddress 
  } = useAuction();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tokenAmount || tokenAmount <= 0) return;
    
    const cost = Number(calculateCost(tokenAmount));
    const overpayAmount = Number(overpay) || 0;
    const totalPayment = cost + overpayAmount;
    
    buyTokens(tokenAmount, totalPayment.toString());
  };

  const cost = tokenAmount ? calculateCost(tokenAmount) : '0';
  const remainingAllowance = purchaseInfo ? Number(purchaseInfo[2]) : Number(maxTokensPerAddress);
  const maxPurchase = Math.min(
    Number(maxTokensPerAddress), 
    remainingAllowance,
    auctionInfo ? Number(auctionInfo[4]) : 0 // remaining tokens
  );

  const isAuctionActive = auctionInfo ? auctionInfo[2] : false;

  if (!isAuctionActive) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Purchase Tokens</h3>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Auction Not Active</h4>
          <p className="text-gray-600">
            The auction is not currently active. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Purchase Tokens</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Price Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Current Price</div>
            <div className="text-2xl font-bold text-green-600">
              {Number(currentPrice).toFixed(6)} ETH
            </div>
            <div className="text-xs text-gray-500">per token</div>
          </div>
        </div>

        {/* Token Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Tokens
          </label>
          <input
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            max={maxPurchase}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-xs text-gray-500 mt-1">
            Max: {maxPurchase} tokens (Your remaining allowance: {remainingAllowance})
          </div>
        </div>

        {/* Cost Calculation */}
        {tokenAmount && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cost:</span>
              <span className="font-semibold">{Number(cost).toFixed(6)} ETH</span>
            </div>
          </div>
        )}

        {/* Optional Overpay */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Payment (Optional)
            <span className="text-xs text-gray-500 ml-1">- Helps ensure transaction success</span>
          </label>
          <input
            type="number"
            value={overpay}
            onChange={(e) => setOverpay(e.target.value)}
            placeholder="0.001"
            step="0.001"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-xs text-gray-500 mt-1">
            Any overpayment will be refunded automatically
          </div>
        </div>

        {/* Total Payment */}
        {(tokenAmount || overpay) && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Payment:</span>
              <span className="font-bold text-green-600">
                {(Number(cost) + Number(overpay || 0)).toFixed(6)} ETH
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!tokenAmount || tokenAmount <= 0 || tokenAmount > maxPurchase || isBuying}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isBuying ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Buy Tokens'
          )}
        </button>

        {/* Quick Buy Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            Math.floor(maxPurchase * 0.25),
            Math.floor(maxPurchase * 0.5),
            maxPurchase
          ].filter(amount => amount > 0).map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setTokenAmount(amount.toString())}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {amount === maxPurchase ? 'Max' : `${amount}`}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

export default BuyTokens;