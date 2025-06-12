import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import AuctionStats from './components/AuctionStats';
import BuyTokens from './components/BuyTokens';
import Timer from './components/Timer';

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">$JUNE in June Auction</h1>
            <p className="text-gray-600 mt-2">Enhanced Token Auction Platform</p>
          </div>
          <ConnectButton />
        </div>

        {isConnected ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Auction Stats - Takes 2 columns */}
            <div className="lg:col-span-2">
              <AuctionStats />
            </div>
            
            {/* Buy Tokens Panel */}
            <div className="space-y-6">
              <Timer />
              <BuyTokens />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to participate in the Dutch auction
              </p>
              <ConnectButton />
            </div>
          </div>
        )}
        {/* Auction Explanation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 pt-4">
          <h2 className="text-2xl font-semibold mb-4">How the Dutch Auction Works</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Auction Mechanics</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Price starts high and decreases over time</li>
                <li>• Buy tokens at the current price</li>
                <li>• Limited tokens per address</li>
                <li>• Auction ends when time expires or tokens sell out</li>
                <li>• JIJ Token Address - 0xEff4d473CBa3d9ea7949f8fE3Ac6354ADa593Ae0</li>
                <li>• Auction Address - 0x5D70abeEc006022617e55D19A227de1c6c99Fa6e</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Key Features</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Automatic price reduction at intervals</li>
                <li>• Reserve price (minimum price)</li>
                <li>• Per-address purchase limits</li>
                <li>• Secure and transparent on-chain</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;