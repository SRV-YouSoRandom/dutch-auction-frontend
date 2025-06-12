// Your deployed contract address
export const AUCTION_CONTRACT_ADDRESS = "0x5D70abeEc006022617e55D19A227de1c6c99Fa6e";

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