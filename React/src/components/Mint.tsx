import { useState } from 'react';
import { Account } from "@aptos-labs/ts-sdk";
import { mintCoin } from '../utils/aptos-utils';

interface MintProps {
  admin: Account;
  userAddress: string;
  onMintComplete?: (hash: string) => void;
  className?: string;
}

export function Mint({ admin, userAddress, onMintComplete, className = '' }: MintProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleMintToken = async () => {
    if (!userAddress) return;
    
    try {
      setLoading(true);
      const hash = await mintCoin(admin, userAddress, 100 * 100000000);
      onMintComplete?.(hash);
    } catch (error) {
      console.error("Mint error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMintToken}
      disabled={loading}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 ${className}`}
    >
      {loading ? 'Processing...' : 'Mint 100 DEVX'}
    </button>
  );
} 