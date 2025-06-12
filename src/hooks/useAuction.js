import { useContractRead, useContractWrite, useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { AUCTION_CONTRACT_ADDRESS } from '../utils/constants';
import DutchAuctionABI from '../abi/DutchAuction.json';

export function useAuction() {
  const { address } = useAccount();

  // Read auction info
  const { data: auctionInfo, refetch: refetchAuctionInfo } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'getAuctionInfo',
    watch: true,
  });

  // Read current price
  const { data: currentPrice } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'getCurrentPrice',
    watch: true,
  });

  // Read user purchase info
  const { data: purchaseInfo } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'getPurchaseInfo',
    args: [address],
    enabled: !!address,
    watch: true,
  });

  // Read auction parameters
  const { data: maxTokensPerAddress } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'maxTokensPerAddress',
  });

  const { data: minBidIncrement } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'minBidIncrement',
  });

  const { data: reservePrice } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'reservePrice',
  });

  const { data: startingPrice } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'startingPrice',
  });

  const { data: totalTokenAmount } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'totalTokenAmount',
  });

  // Buy tokens function
  const { write: buyTokens, isLoading: isBuying } = useContractWrite({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: DutchAuctionABI,
    functionName: 'buyTokens',
    onSuccess: () => {
      refetchAuctionInfo();
    },
  });

  const handleBuyTokens = (tokenAmount, ethValue) => {
    buyTokens({
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
    buyTokens: handleBuyTokens,
    isBuying,
    calculateCost,
    refetchAuctionInfo,
  };
}