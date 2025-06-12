// Your deployed contract address
export const AUCTION_CONTRACT_ADDRESS = "0x7e7feAC35f55dFD6DC28c0E359e01119dDD1beB7";

// Define your custom chain here
export const customChain = {
  id: 101003, // Replace with your chain ID
  name: 'June Socotra',
  network: 'custom',
  nativeCurrency: {
    decimals: 18,
    name: 'JUNE',
    symbol: 'JUNE',
  },
  rpcUrls: {
    public: { http: ['rpc.socotra-testnet.network/ext/bc/JUNE/rpc'] }, // Replace with your RPC URL
    default: { http: ['rpc.socotra-testnet.network/ext/bc/JUNE/rpc'] }, // Replace with your RPC URL
  },
  blockExplorers: {
    default: { name: 'MCNScan', url: 'https://socotra.juneoscan.io/' }, // Replace with your explorer
  },
};