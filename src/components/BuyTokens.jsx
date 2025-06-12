import { useState } from 'react';
import { useAuction } from '../hooks/useAuction';

function BuyTokens() {
  const [tokenAmount, setTokenAmount] = useState('');
  const [overpay, setOverpay] = useState('');
  const [tokenError, setTokenError] = useState(''); // Added for validation errors
  
  const { 
    auctionInfo, 
    currentPrice, 
    buyTokens, 
    isBuying, 
    calculateCost,
    purchaseInfo,
    maxTokensPerAddress,
    isPaused
  } = useAuction();

  // Validate token amount input
  const validateTokenAmount = (value) => {
    if (!value) {
      setTokenError('');
      return true;
    }

    // Check if it's a valid number
    const numValue = Number(value);
    if (isNaN(numValue)) {
      setTokenError('Please enter a valid number');
      return false;
    }

    // Check if it's a whole number
    if (!Number.isInteger(numValue)) {
      setTokenError('Only whole tokens are allowed. Decimal values are not supported.');
      return false;
    }

    // Check if it's positive
    if (numValue <= 0) {
      setTokenError('Token amount must be greater than 0');
      return false;
    }

    // Check if it exceeds max purchase
    if (numValue > maxPurchase) {
      setTokenError(`Maximum purchase is ${maxPurchase} tokens`);
      return false;
    }

    setTokenError('');
    return true;
  };

  const handleTokenAmountChange = (e) => {
    const value = e.target.value;
    setTokenAmount(value);
    validateTokenAmount(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate before submission
    if (!validateTokenAmount(tokenAmount)) {
      return;
    }
    
    if (!tokenAmount || tokenAmount <= 0) return;
    
    const cost = Number(calculateCost(tokenAmount));
    const overpayAmount = Number(overpay) || 0;
    const totalPayment = cost + overpayAmount;
    
    buyTokens(tokenAmount, totalPayment.toString());
  };

  // Only calculate cost if tokenAmount is valid (whole number)
  const cost = tokenAmount && !tokenError && Number.isInteger(Number(tokenAmount)) && Number(tokenAmount) > 0 
    ? calculateCost(tokenAmount) 
    : '0';

  // Calculate remaining allowance properly (following AuctionStats pattern)
  const getRemainingTokensFromRawCount = (maxAllowed, purchasedRaw) => {
    if (!maxAllowed || !purchasedRaw) return Number(maxAllowed) / 1e18;
    const remaining = BigInt(maxAllowed) - (BigInt(purchasedRaw) * 10n ** 18n);
    return Number(remaining / 10n ** 18n);
  };

  const remainingAllowance = purchaseInfo 
    ? getRemainingTokensFromRawCount(maxTokensPerAddress, purchaseInfo[0])
    : Number(maxTokensPerAddress) / 1e18;

  const totalTokensFormatted = auctionInfo ? Number(BigInt(auctionInfo[4])) : 0; // remaining tokens from auction
  const maxTokensPerAddressFormatted = Number(maxTokensPerAddress) / 1e18;

  const maxPurchase = Math.min(
    maxTokensPerAddressFormatted,
    remainingAllowance,
    totalTokensFormatted
  );

  const isAuctionActive = auctionInfo ? auctionInfo[2] && !isPaused : false;

  // Show different messages based on auction state
  const getInactiveMessage = () => {
    if (!auctionInfo) return { title: 'Loading...', message: 'Please wait while we load auction data.' };
    
    const [started, cancelled, active] = auctionInfo;
    
    if (cancelled) {
      return {
        title: 'Auction Cancelled',
        message: 'This auction has been cancelled and is no longer accepting purchases.',
        icon: (
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    }
    
    if (isPaused) {
      return {
        title: 'Auction Paused',
        message: 'The auction is temporarily paused. Token purchases will resume when the auction is unpaused.',
        icon: (
          <svg className="w-16 h-16 mx-auto mb-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    }
    
    if (!started) {
      return {
        title: 'Auction Not Started',
        message: 'The auction has not started yet. Please check back later.',
        icon: (
          <svg className="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    }
    
    if (started && !active) {
      return {
        title: 'Auction Ended',
        message: 'This auction has ended and is no longer accepting purchases.',
        icon: (
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    }
    
    return {
      title: 'Auction Not Active',
      message: 'The auction is not currently active. Please check back later.',
      icon: (
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
  };

  if (!isAuctionActive) {
    const inactiveState = getInactiveMessage();
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-600">Purchase Tokens</h3>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            {inactiveState.icon}
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">{inactiveState.title}</h4>
          <p className="text-gray-600">
            {inactiveState.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Purchase Tokens</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Price Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Current Price</div>
            <div className="text-2xl font-bold text-green-600">
              {Number(currentPrice).toFixed(4)} JUNE
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
            onChange={handleTokenAmountChange}
            placeholder="Enter whole number (e.g., 1, 5, 10)"
            min="1"
            step="1"
            max={maxPurchase}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              tokenError 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          
          {/* Error Message */}
          {tokenError && (
            <div className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {tokenError}
            </div>
          )}
          
          {/* Help Text */}
          <div className="text-xs text-gray-500 mt-1">
            Remaining: {maxPurchase.toLocaleString(undefined, { maximumFractionDigits: 0 })} $JIJ
            <br />
            <span className="text-blue-600 font-medium">Note: Only whole tokens accepted (no decimals)</span>
          </div>
        </div>

        {/* Cost Calculation */}
        {tokenAmount && !tokenError && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cost:</span>
              <span className="font-semibold text-gray-900">{Number(cost).toFixed(6)} JUNE</span>
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
        {(tokenAmount && !tokenError) || overpay ? (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Payment:</span>
              <span className="font-bold text-green-600">
                {(Number(cost) + Number(overpay || 0)).toFixed(6)} JUNE
              </span>
            </div>
          </div>
        ) : null}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!tokenAmount || tokenAmount <= 0 || tokenAmount > maxPurchase || isBuying || tokenError}
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
            Math.floor(maxPurchase)
          ].filter(amount => amount > 0).map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setTokenAmount(amount.toString());
                validateTokenAmount(amount.toString());
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              {amount === Math.floor(maxPurchase) ? 'Max' : `${amount.toLocaleString()}`}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

export default BuyTokens;