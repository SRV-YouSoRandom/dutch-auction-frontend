// Your deployed contract address
export const AUCTION_CONTRACT_ADDRESS = "0x7e7feAC35f55dFD6DC28c0E359e01119dDD1beB7";

// Define your custom chain here (updated for wagmi v2)
export const customChain = {
  id: 101003,
  name: 'June Socotra',
  network: 'custom',
  nativeCurrency: {
    decimals: 18,
    name: 'JUNE',
    symbol: 'JUNE',
  },
  rpcUrls: {
    default: { 
      http: ['https://rpc.socotra-testnet.network/ext/bc/JUNE/rpc'] // Added https://
    },
  },
  blockExplorers: {
    default: { 
      name: 'MCNScan', 
      url: 'https://socotra.juneoscan.io/' 
    },
  },
  testnet: true, // Add this since it's a testnet
};