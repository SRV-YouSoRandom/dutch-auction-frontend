import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { AUCTION_CONTRACT_ADDRESS } from '../utils/constants';
import DutchAuctionABI from '../abi/DutchAuction.json';

export function useAuction() {
  const { address } = useAccount();

  // Read auction info
  const { data: auctionInfo, refetch: refetchAuctionInfo } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'getAuctionInfo',
    query: {
      refetchInterval: 1000, // Refetch every second for real-time updates
    },
  });

  // Read current price
  const { data: currentPrice } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'getCurrentPrice',
    query: {
      refetchInterval: 1000,
    },
  });

  // Read paused status
  const { data: isPaused } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'paused',
    query: {
      refetchInterval: 1000,
    },
  });

  // Read user purchase info
  const { data: purchaseInfo } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'getPurchaseInfo',
    args: [address],
    query: {
      enabled: !!address,
      refetchInterval: 1000,
    },
  });

  // Read auction parameters
  const { data: maxTokensPerAddress } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'maxTokensPerAddress',
  });

  const { data: minBidIncrement } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'minBidIncrement',
  });

  const { data: reservePrice } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'reservePrice',
  });

  const { data: startingPrice } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'startingPrice',
  });

  const { data: totalTokenAmount } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'totalTokenAmount',
  });

  // Buy tokens function
  const { writeContract: buyTokens, isPending: isBuying } = useWriteContract({
    onSuccess: () => {
      refetchAuctionInfo();
    },
  });

  const handleBuyTokens = (tokenAmount, ethValue) => {
    buyTokens({
      address: AUCTION_CONTRACT_ADDRESS,
      abi: DutchAuctionABI,
      functionName: 'buyTokens',
      args: [tokenAmount],
      value: parseEther(ethValue.toString()),
    });
  };

  // Calculate cost
  const calculateCost = (tokenAmount) => {
    if (!currentPrice || !tokenAmount) return '0';
    const cost = BigInt(currentPrice) * BigInt(tokenAmount);
    return formatEther(cost);
  };

  return {
    auctionInfo,
    currentPrice: currentPrice ? formatEther(currentPrice) : '0',
    purchaseInfo,
    maxTokensPerAddress: maxTokensPerAddress ? maxTokensPerAddress.toString() : '0',
    minBidIncrement: minBidIncrement ? formatEther(minBidIncrement) : '0',
    reservePrice: reservePrice ? formatEther(reservePrice) : '0',
    startingPrice: startingPrice ? formatEther(startingPrice) : '0',
    totalTokenAmount: totalTokenAmount ? totalTokenAmount.toString() : '0',
    isPaused: isPaused || false, // Added isPaused with default fallback
    buyTokens: handleBuyTokens,
    isBuying,
    calculateCost,
    refetchAuctionInfo,
  };
}