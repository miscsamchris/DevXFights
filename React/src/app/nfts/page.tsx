'use client';

import { useState, useEffect } from 'react';

export default function NFTsPage() {
  const [nfts, setNFTs] = useState([]);

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    const query = `
      query MyQuery {
        current_token_ownerships_v2(
          offset: 0
          where: {owner_address: {_eq: "0x76ed6cee3405cb48818d37660d8b11cc63043a76721cbc224ab8f553b5f69698"}}
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

    try {
      console.log('Making GraphQL request to fetch NFTs');
      const response = await fetch(
        "https://aptos-testnet.nodit.io/zIcivJ82QDnhpUOOfD4ukhm_8To~tqiC/v1/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      const result = await response.json();
      console.log('NFT data received:', result);
      
      // Set the NFTs state with the received data
      setNFTs(result.data.current_token_ownerships_v2);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  // Show loading state while fetching NFTs
  if (nfts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading NFTs...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {nfts.map((nft, index) => (
        <div key={index} className="border rounded-lg p-4 shadow-md bg-white">
          <h3 className="text-xl font-bold mb-2">
            {nft.current_token_data.token_name}
          </h3>
          <div className="text-sm text-gray-600">
            <p className="mb-1">
              <span className="font-semibold">Collection:</span>{' '}
              {nft.current_token_data.current_collection.collection_name}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Collection ID:</span>{' '}
              {nft.current_token_data.collection_id.substring(0, 8)}...
            </p>
            <p className="mb-1">
              <span className="font-semibold">Owner:</span>{' '}
              {nft.owner_address.substring(0, 8)}...
            </p>
            <a 
              href={nft.current_token_data.token_uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              View Metadata
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}