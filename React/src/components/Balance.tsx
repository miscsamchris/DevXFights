'use client';
import { useEffect, useState } from 'react';
import { getFaBalance, token } from '../utils/aptos-utils';



export function Balance() {
  const [balance, setBalance] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const userWalletAddress = storedUser ? JSON.parse(storedUser).walletAddress : '';
    setWalletAddress(userWalletAddress);

    const fetchBalance = async () => {
      if (userWalletAddress) {
        try {
          const balance = await getFaBalance(userWalletAddress, token);
          const balanceInDevx = Number(balance) ;
          setBalance(balanceInDevx);
        } catch (error) {
          console.error('Error in fetchBalance:', error);
        }
      }
    };

    if (userWalletAddress) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  if (!walletAddress) return null;

  return (
    <div className="flex flex-col items-end gap-2 bg-slate-800/50 p-3 rounded-lg border border-purple-600">
      <div className="text-gray-400 text-sm">
        {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
      </div>
      <div className="text-white font-medium">
        Balance: {balance} DEVX
      </div>
    </div>
  );
} 