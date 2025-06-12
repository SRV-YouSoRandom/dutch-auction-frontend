// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract EnhancedDutchAuction is 
    Initializable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable 
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // Auction asset
    IERC20Upgradeable public auctionToken;
    
    // Auction parameters
    uint256 public startingPrice;
    uint256 public reservePrice;
    uint256 public priceDecrement;
    uint256 public interval; // seconds between price decrements
    uint256 public startTime;
    uint256 public duration;
    uint256 public totalTokenAmount; // Total tokens being auctioned
    uint256 public remainingTokens; // Remaining tokens available
    uint256 public maxTokensPerAddress; // Maximum tokens each address can purchase
    uint256 public minBidIncrement; // Minimum increment for overbids
    
    // State variables
    bool public auctionStarted;
    bool public auctionCancelled;
    address public beneficiary;
    
    // Tracking purchases
    mapping(address => uint256) public purchasedTokens; // tokens purchased by each address
    mapping(address => uint256) public paidAmounts; // total amount paid by each address
    address[] public buyers; // list of all buyers
    
    // Events
    event AuctionInitialized(
        address indexed token,
        uint256 totalAmount,
        uint256 startingPrice,
        uint256 reservePrice
    );
    event TokensDeposited(uint256 amount);
    event AuctionStarted(uint256 startTime);
    event TokensPurchased(
        address indexed buyer, 
        uint256 tokenAmount, 
        uint256 pricePerToken,
        uint256 totalPaid
    );
    event AuctionPaused();
    event AuctionUnpaused();
    event AuctionCancelled();
    event FundsWithdrawn(address indexed to, uint256 amount);
    event UnsoldTokensReclaimed(uint256 amount);
    event EmergencyTokenRecovery(address indexed token, address indexed to, uint256 amount);

    /// @notice Initialize the Dutch auction contract
    function initialize(
        address _auctionToken,
        uint256 _totalTokenAmount,
        uint256 _startingPrice,
        uint256 _reservePrice,
        uint256 _priceDecrement,
        uint256 _interval,
        uint256 _duration,
        uint256 _maxTokensPerAddress,
        uint256 _minBidIncrement,
        address _beneficiary
    ) external initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();
        __ReentrancyGuard_init();

        // Validation
        require(_auctionToken != address(0), "Invalid auction token");
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_totalTokenAmount > 0, "Token amount must be positive");
        require(_startingPrice > _reservePrice, "Starting price must be higher than reserve");
        require(_priceDecrement > 0, "Price decrement must be positive");
        require(_duration > 0, "Duration must be positive");
        require(_interval > 0, "Interval must be positive");
        require(_maxTokensPerAddress > 0, "Max tokens per address must be positive");
        require(_maxTokensPerAddress <= _totalTokenAmount, "Max per address cannot exceed total");

        auctionToken = IERC20Upgradeable(_auctionToken);
        totalTokenAmount = _totalTokenAmount;
        remainingTokens = _totalTokenAmount;
        startingPrice = _startingPrice;
        reservePrice = _reservePrice;
        priceDecrement = _priceDecrement;
        interval = _interval;
        duration = _duration;
        maxTokensPerAddress = _maxTokensPerAddress;
        minBidIncrement = _minBidIncrement;
        beneficiary = _beneficiary;

        emit AuctionInitialized(_auctionToken, _totalTokenAmount, _startingPrice, _reservePrice);
    }

    /// @notice Deposit tokens for auction (must be called before starting auction)
    function depositTokens() external onlyOwner {
        require(!auctionStarted, "Cannot deposit after auction started");
        require(!auctionCancelled, "Auction is cancelled");
        
        uint256 contractBalance = auctionToken.balanceOf(address(this));
        require(contractBalance >= totalTokenAmount, "Insufficient tokens deposited");
        
        emit TokensDeposited(totalTokenAmount);
    }

    /// @notice Start the Dutch auction
    function startAuction() external onlyOwner {
        require(!auctionStarted, "Auction already started");
        require(!auctionCancelled, "Auction is cancelled");
        require(auctionToken.balanceOf(address(this)) >= totalTokenAmount, "Tokens not deposited");
        
        auctionStarted = true;
        startTime = block.timestamp;
        
        emit AuctionStarted(startTime);
    }

    /// @notice Get current price per token
    function getCurrentPrice() public view returns (uint256) {
        if (!auctionStarted || auctionCancelled) {
            return startingPrice;
        }
        
        uint256 elapsed = block.timestamp - startTime;
        
        if (elapsed >= duration) {
            return reservePrice;
        }
        
        uint256 steps = elapsed / interval;
        uint256 discount = steps * priceDecrement;
        
        if (startingPrice <= discount) {
            return reservePrice;
        }
        
        return startingPrice - discount;
    }

    /// @notice Purchase tokens at current price
    /// @param tokenAmount Number of tokens to purchase
    function buyTokens(uint256 tokenAmount) external payable nonReentrant whenNotPaused {
        require(auctionStarted, "Auction not started");
        require(!auctionCancelled, "Auction is cancelled");
        require(isAuctionActive(), "Auction has ended");
        require(tokenAmount > 0, "Token amount must be positive");
        require(remainingTokens >= tokenAmount, "Not enough tokens remaining");
        
        // Check per-address limit
        require(
            purchasedTokens[msg.sender] + tokenAmount <= maxTokensPerAddress,
            "Exceeds maximum tokens per address"
        );
        
        uint256 currentPrice = getCurrentPrice();
        uint256 totalCost = currentPrice * tokenAmount;
        
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Check minimum bid increment for overpayment
        if (msg.value > totalCost) {
            require(
                msg.value - totalCost >= minBidIncrement,
                "Overpayment below minimum increment"
            );
        }
        
        // Update state
        remainingTokens -= tokenAmount;
        purchasedTokens[msg.sender] += tokenAmount;
        paidAmounts[msg.sender] += totalCost;
        
        // Track new buyers
        if (purchasedTokens[msg.sender] == tokenAmount) {
            buyers.push(msg.sender);
        }
        
        // Transfer tokens
        auctionToken.safeTransfer(msg.sender, tokenAmount);
        
        // Refund overpayment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(msg.sender, tokenAmount, currentPrice, totalCost);
    }

    /// @notice Cancel the auction (emergency function)
    function cancelAuction() external onlyOwner {
        require(auctionStarted, "Auction not started");
        require(!auctionCancelled, "Already cancelled");
        
        auctionCancelled = true;
        
        emit AuctionCancelled();
    }

    /// @notice Reclaim unsold tokens after auction ends
    function reclaimUnsoldTokens() external onlyOwner {
        require(auctionStarted, "Auction not started");
        require(!isAuctionActive() || auctionCancelled, "Auction still active");
        require(remainingTokens > 0, "No unsold tokens");
        
        uint256 unsoldAmount = remainingTokens;
        remainingTokens = 0;
        
        auctionToken.safeTransfer(beneficiary, unsoldAmount);
        
        emit UnsoldTokensReclaimed(unsoldAmount);
    }

    /// @notice Pause the auction
    function pause() external onlyOwner {
        _pause();
        emit AuctionPaused();
    }

    /// @notice Unpause the auction
    function unpause() external onlyOwner {
        _unpause();
        emit AuctionUnpaused();
    }

    /// @notice Withdraw collected funds
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(beneficiary).transfer(balance);
        
        emit FundsWithdrawn(beneficiary, balance);
    }

    /// @notice Emergency recovery of wrong tokens sent to contract
    function emergencyTokenRecovery(
        address tokenAddress,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(tokenAddress != address(auctionToken), "Cannot recover auction token");
        require(to != address(0), "Invalid recipient");
        
        IERC20Upgradeable(tokenAddress).safeTransfer(to, amount);
        
        emit EmergencyTokenRecovery(tokenAddress, to, amount);
    }

    // View Functions

    /// @notice Check if auction is currently active
    function isAuctionActive() public view returns (bool) {
        if (!auctionStarted || auctionCancelled || remainingTokens == 0) {
            return false;
        }
        return block.timestamp <= startTime + duration;
    }

    /// @notice Get remaining time in seconds
    function getRemainingTime() external view returns (uint256) {
        if (!auctionStarted || auctionCancelled) {
            return 0;
        }
        
        uint256 endTime = startTime + duration;
        if (block.timestamp >= endTime) {
            return 0;
        }
        
        return endTime - block.timestamp;
    }

    /// @notice Get comprehensive auction information
    function getAuctionInfo() external view returns (
        bool started,
        bool cancelled,
        bool active,
        uint256 currentPrice,
        uint256 remaining,
        uint256 sold,
        uint256 timeRemaining,
        uint256 totalBuyers
    ) {
        started = auctionStarted;
        cancelled = auctionCancelled;
        active = isAuctionActive();
        currentPrice = getCurrentPrice();
        remaining = remainingTokens;
        sold = totalTokenAmount - remainingTokens;
        timeRemaining = active ? (startTime + duration - block.timestamp) : 0;
        totalBuyers = buyers.length;
    }

    /// @notice Get purchase information for a specific address
    function getPurchaseInfo(address buyer) external view returns (
        uint256 tokensPurchased,
        uint256 totalPaid,
        uint256 remainingAllowance
    ) {
        tokensPurchased = purchasedTokens[buyer];
        totalPaid = paidAmounts[buyer];
        remainingAllowance = maxTokensPerAddress - tokensPurchased;
    }

    /// @notice Get list of all buyers
    function getAllBuyers() external view returns (address[] memory) {
        return buyers;
    }

    /// @notice Get number of buyers
    function getBuyerCount() external view returns (uint256) {
        return buyers.length;
    }

    /// @notice Calculate cost for purchasing specific amount of tokens
    function calculateCost(uint256 tokenAmount) external view returns (uint256) {
        return getCurrentPrice() * tokenAmount;
    }
}