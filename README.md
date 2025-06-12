# 🕳️ Dutch Auction DApp

A minimal, fast-deploying Dutch Auction DApp built with React and deployed contracts via [Remix](https://remix.ethereum.org/). Designed for educational purposes and rapid prototyping.

> 🚀 Live Demo: [https://dutchauction.souravde.xyz](https://dutchauction.souravde.xyz)
> 📬 Contact: [https://souravde.xyz](https://souravde.xyz)

![dutchauction souravde xyz_](https://github.com/user-attachments/assets/8dd6f837-7cc3-427d-9d17-141f5db20cd8)

---

## ⚙️ Quick Setup Instructions

This guide walks you through deploying your own Dutch Auction DApp using Remix and connecting it to the frontend.

---

## 🛠️ Step 1: Deploy Smart Contracts via Remix

1. **Go to [Remix](https://remix.ethereum.org/)** and open both smart contracts:

   * `juneInJune.sol` (ERC20 Token)
   * `dutchAuction.sol` (Dutch Auction logic)

2. **Compile and Deploy ERC20 Token**

   * Compile `juneInJune.sol`
   * Deploy using desired name, symbol, and total supply.

3. **Compile and Deploy Dutch Auction Contract**

   * Compile `dutchAuction.sol`
   * Deploy the DutchAuction contract.

---

## 🧾 Step 2: Initialize the Auction

After deploying both contracts, you must call the `initialize()` function on the Dutch Auction contract.

### Example Parameters:

```solidity
initialize(
  tokenAddress,     // Address of the ERC20 token
  startPrice,       // e.g. 1000000000000000000 (1 ETH in wei)
  reservePrice,     // e.g. 10000000000000000 (0.01 ETH)
  priceDecrement,   // e.g. 1000000000000000 (0.001 ETH per block)
  duration,         // Number of blocks the auction runs
  auctionAmount     // Total tokens for sale
)
```

⚠️ Ensure the `tokenAddress` is from the ERC20 you deployed earlier.

---

## 💰 Step 3: Token Transfer & Deposit

Before starting the auction:

1. **Transfer the auction token amount** from your wallet to the Dutch Auction contract address.
2. Go back to the Dutch Auction contract and call `depositTokens()`.

✅ Only after this step is complete should you move to the frontend and click **"Start Auction"**.

---

## 🖥️ Step 4: Setup the Frontend

Clone and configure the frontend:

```bash
git clone https://github.com/SRV-YouSoRandom/dutch-auction-frontend.git
cd dutch-auction-frontend
npm install
```

Then configure:

### 1. Update Contract Address

In `src/utils/constants.js`:

```js
export const AUCTION_CONTRACT_ADDRESS = "0xYourAuctionContractAddressHere";
```

### 2. Set Custom Chain Info

Set `customChain` inside `constants.js` with your target chain (e.g. Localhost, Sepolia, etc).

### 3. Paste Contract ABI

In `src/abi/DutchAuction.json`, replace the ABI with the updated one from Remix after compilation.

---

## 🚦 Run the Frontend

Once everything is set:

```bash
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000) to view the DApp.

---

## 🧪 Customization

You can modify the token name, symbol, or parameters of the Dutch Auction in the respective Solidity files before deploying. This DApp is designed for flexibility.

---

## 📄 License

This project is licensed **strictly for educational and personal use**.

* ❌ **Commercial use is NOT permitted**.
* ✅ **You may fork or study the code freely for learning purposes**.
* 📬 If you'd like to use it commercially, please [contact me](https://souravde.xyz).

---

## 👨‍💻 Author

Made with ❤️ by [Sourav](https://souravde.xyz)
