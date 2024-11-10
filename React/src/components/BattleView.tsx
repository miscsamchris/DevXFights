"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { BattleResult } from './BattleResult';
import { BattleCard } from './BattleCard';

interface NFTMetadata {
  image: string;
  // Add other metadata fields if needed
}

export function BattleView() {
  const [allNfts, setAllNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [battleResultData, setBattleResultData] = useState<any>(null);

  const fetchMetadata = async (uri: string): Promise<NFTMetadata> => {
    try {
      console.log('Fetching metadata from URI:', uri);
      const response = await fetch(uri);
      const metadata = await response.json();
      console.log('Fetched metadata:', metadata);
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return { image: '' }; // Return default if fetch fails
    }
  };

  const fetchAllUserNfts = async () => {
    try {
        const currentUserWallet = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).walletAddress : '';
        console.log('Current user wallet:', currentUserWallet);
      
      const usersResponse = await fetch('/api/get-all-users-sbts');
      const { users } = await usersResponse.json();
      const sbtAddress = users[0].sbtAddress; // Get sbtAddress from first user
      console.log('Fetched users:', users);
      console.log('SBT address:', sbtAddress);
      
      const otherUsers = users.filter((user: any) => 
        user.walletAddress.toLowerCase() !== currentUserWallet?.toLowerCase()
      );
      console.log('Filtered other users:', otherUsers);

      const allNftsPromises = otherUsers.map(async (user: any) => {
        console.log('Fetching NFTs for user:', user.username);
        const query = `
          query MyQuery {
            current_token_ownerships_v2(
              offset: 0
              where: {
                owner_address: {_eq: "${user.walletAddress}"},
                current_token_data: {
                  collection_id: {_eq: "${sbtAddress}"}
                }
              }
            ) {
              owner_address
              current_token_data {
                collection_id
                token_name
                current_collection {
                  collection_name
                }
                token_uri
              }
            }
          }
        `;

        const response = await fetch(
          "https://aptos-testnet.nodit.io/zIcivJ82QDnhpUOOfD4ukhm_8To~tqiC/v1/graphql",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          }
        );

        const result = await response.json();
        console.log('GraphQL result for user:', user.username, result);
        
        // Fetch metadata for each NFT
        const nftsWithMetadata = await Promise.all(
          result.data.current_token_ownerships_v2.map(async (nft: any) => {
            console.log('Fetching metadata for NFT:', nft.current_token_data.token_name);
            const metadata = await fetchMetadata(nft.current_token_data.token_uri);
            return {
              ...nft,
              metadata
            };
          })
        );

        console.log('NFTs with metadata for user:', user.username, nftsWithMetadata);
        return {
          username: user.username,
          nfts: nftsWithMetadata
        };
      });

      const results = await Promise.all(allNftsPromises);
      console.log('Final results:', results);
      setAllNfts(results);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('BattleView component mounted');
    fetchAllUserNfts();
  }, []);

  const handleBattleChallenge = async (challengerNft: any, challengerUsername: string) => {
    try {
      console.log('Challenge initiated with:', {
        challengerNft,
        challengerUsername
      });

      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      
      if (!currentUser) {
        console.error('No current user found');
        return;
      }

      console.log('Current user:', currentUser);

      // Get metadata for challenger NFT
      const challengerMetadata = await fetchMetadata(challengerNft.current_token_data.token_uri);
      console.log('Challenger metadata:', challengerMetadata);
      
      const battlePayload = {
        challenger: {
          username: challengerUsername,
          nftData: challengerMetadata,
          tokenId: challengerNft.current_token_data.token_name,
          nftUri: challengerNft.current_token_data.token_uri,
          avatar: challengerMetadata.image
        },
        defender: {
          username: currentUser.username,
          walletAddress: currentUser.walletAddress,
          nftUri: challengerNft.current_token_data.token_uri,
          avatar: currentUser.avatar
        }
      };
      
      console.log('Battle request payload:', battlePayload);

      const response = await fetch('/api/battle/nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(battlePayload)
      });

      if (!response.ok) {
        console.error('Battle request failed with status:', response.status);
        throw new Error(`Battle request failed: ${response.statusText}`);
      }

      const battleResult = await response.json();
      console.log('Battle result:', battleResult);
      
      // Show battle result in modal
      setBattleResultData(battleResult);

    } catch (error) {
      console.error('Error initiating battle:', error);
      alert('Failed to initiate battle. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-white text-center">Loading battle cards...</div>;
  }

  console.log('Rendering battle cards with NFTs:', allNfts);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Available Battles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allNfts.map((userNfts, userIndex) => (
          userNfts.nfts.map((nft: any, nftIndex: number) => (
            <BattleCard
              key={`${userIndex}-${nftIndex}`}
              nft={nft}
              username={userNfts.username}
              onChallenge={() => handleBattleChallenge(nft, userNfts.username)}
            />
          ))
        ))}
      </div>

      {battleResultData && (
        <BattleResult
          battleResult={battleResultData}
          onClose={() => setBattleResultData(null)}
        />
      )}
    </div>
  );
} 