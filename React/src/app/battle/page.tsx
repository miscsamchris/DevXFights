"use client";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
    Aptos,
    Account,
    Ed25519PrivateKey,
    Serializer,
    MoveVector,
    U64,
    InputViewFunctionData,
  } from "@aptos-labs/ts-sdk";
import { connected } from "process";
import { useState, useEffect } from "react";
import {  AptosConfig, Network } from "@aptos-labs/ts-sdk"

  
const config = new AptosConfig({ network: Network.TESTNET });
// Aptos is the main entrypoint for all functions
const aptos = new Aptos(config);
export const moduleAddress =
  "0a9b9a08f54d21e5662694c9fa036b4f6907255f3b8ac552c84b2d374f5945b1";
export const token = '0xcc12552de21078ebce251c0a09193eb7ea799316c77142165990cd96ea815b34';

async function getMetadata(admin: Account): Promise<string> {
  const payload: InputViewFunctionData = {
    function: `${moduleAddress}::devx_token::get_metadata`,
    functionArguments: [],
  };
  const res = (await aptos.view<[{ inner: string }]>({ payload }))[0];
  return res.inner;
}


const getFaBalance = async (
    ownerAddress: string,
    assetType: string
  ): Promise<number> => {
    try {
      const data = await aptos.getCurrentFungibleAssetBalances({
        options: {
          where: {
            owner_address: { _eq: ownerAddress },
            asset_type: { _eq: assetType },
          },
        },
      });
      console.log('Raw balance data:', data); // Debug log
      if (data.length === 0) return 0;
      return Number(data[0]?.amount) || 0;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
};

  const privateKey = new Ed25519PrivateKey(
    "0x55d8417da962242250e890c71ab846749022efa349b93e8486991173928da295"
  );
  const admin = Account.fromPrivateKey({ privateKey });

export default function BattlePage() {
  const { account } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [txHash, setTxHash] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string>("");

  useEffect(() => {
    // Get user address from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserAddress(userData.walletAddress);
    }
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (userAddress) {
        try {
          const balance = await getFaBalance(userAddress, token);
          console.log(`Raw balance: ${balance}`);
          // Ensure we're doing proper number conversion
          const balanceInDevx = Number(balance) / 100000000;
          console.log(`Converted balance: ${balanceInDevx} DEVX`);
          setBalance(balanceInDevx);
        } catch (error) {
          console.error('Error in fetchBalance:', error);
        }
      }
    };

    if (userAddress) {
      fetchBalance();
      // Set up polling to refresh balance every 10 seconds
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [userAddress]);

  const handleMintToken = async () => {
    if (!userAddress) return;
    
    try {
      setLoading(true);
      const hash = await mintCoin(admin, userAddress, 100 * 100000000);
      setTxHash(hash);
      
      // Refresh balance after minting
      const newBalance = await getFaBalance(userAddress, token);
      const newBalanceInDevx = newBalance / 100000000;
      console.log(`Balance after minting for ${userAddress}: ${newBalanceInDevx} DEVX`);
      setBalance(newBalanceInDevx);
    } catch (error) {
      console.error("Mint error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeBattle = async () => {
    try {
      setLoading(true);
      const metadataAddress = await getMetadata(admin);
      console.log("metadata address:", metadataAddress);
    } catch (error) {
      console.error("Initialize battle error:", error);
    } finally {
      setLoading(false);
    }
  };

  async function mintCoin(admin: Account, receiver: string, amount: number): Promise<string> {
    const transaction = await aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: '0a9b9a08f54d21e5662694c9fa036b4f6907255f3b8ac552c84b2d374f5945b1::devx_token::mint',
        functionArguments: [receiver, amount],
      },
    });

    const senderAuthenticator = aptos.transaction.sign({ signer: admin, transaction });
    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });

    return pendingTxn.hash;
  }
  async function transferCoin(
    admin: Account,
    fromAddress: string,
    toAddress: string,
    amount: number,
  ): Promise<string> {
    const transaction = await aptos.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${admin.accountAddress}::devx_token::transfer`,
        functionArguments: [fromAddress, toAddress, amount],
      },
    });

    const senderAuthenticator = await aptos.transaction.sign({ signer: admin, transaction });
    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });

    return pendingTxn.hash;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Battle Page</h1>
      
      {userAddress && (
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <p>Connected Address: {userAddress}</p>
            <p>Current Balance: {balance} DEVX</p>
          </div>

          <div className="space-x-4">
            <button
              onClick={handleMintToken}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Mint 100 DEVX'}
            </button>

            <button
              onClick={handleInitializeBattle}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Initialize Battle'}
            </button>
          </div>

          {txHash && (
            <div className="p-4 bg-gray-100 rounded">
              <p className="font-medium">Last Transaction Hash:</p>
              <p className="break-all">{txHash}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
