import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { challenger, defender } = await req.json();
    console.log('Received battle request:', { challenger, defender });

    // Extract relevant attributes from NFT metadata
    const challengerAttributes = challenger.nftData.attributes || [];
    console.log('Challenger attributes:', challengerAttributes);
    
    // Get defender's NFT data using GraphQL
    const defenderNftData = await fetchDefenderNFT(defender.walletAddress);
    console.log('Defender NFT data:', defenderNftData);
    
    // Prepare battle context for AI
    const battleContext = `
      Challenger (${challenger.username}):
      
      Attributes: ${JSON.stringify(challengerAttributes)}

      Defender (${defender.username}):

      Attributes: ${JSON.stringify(defenderNftData.attributes)}
    `;
    console.log('Battle context:', battleContext);

    // Use Claude to determine battle outcome
    const completion = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Based on these two NFTs and their attributes, create a short brutal roast (max 100 words) where one NFT mocks the other:
          ${battleContext}
          
          Format the response as:
          Winner: [username]
          Roast: [brutal but funny roast from winner to loser]`
      }]
    });
    console.log('AI completion:', completion);

    const result = completion.content[0].text;
    console.log('Battle result:', result);

    const response = {
      battleResult: result,
      challenger: challenger.username,
      defender: defender.username
    };
    console.log('Sending response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Battle error:', error);
    return NextResponse.json({ error: 'Battle failed' }, { status: 500 });
  }
}

async function fetchDefenderNFT(walletAddress: string) {
  console.log('Fetching defender NFT for wallet:', walletAddress);
  // Your existing GraphQL query implementation here
  // Similar to the query you provided
  const query = `query MyQuery {
    current_token_ownerships_v2(
      offset: 0
      where: {
        owner_address: {_eq: "${walletAddress}"}
      }
    ) {
      owner_address
      current_token_data {
        collection_id
        token_name
        token_uri
      }
    }
  }`;

  const response = await fetch(
    "https://aptos-testnet.nodit.io/zIcivJ82QDnhpUOOfD4ukhm_8To~tqiC/v1/graphql",
    {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    }
  );
  console.log('GraphQL response:', response);

  const result = await response.json();
  console.log('GraphQL result:', result);
  
  if (!result.data?.current_token_ownerships_v2?.length) {
    throw new Error('No NFTs found for defender');
  }

  // Get the first NFT owned by defender
  const nft = result.data.current_token_ownerships_v2[0];
  console.log('Selected NFT:', nft);
  
  // Fetch metadata for the NFT
  const metadata = await fetch(nft.current_token_data.token_uri).then(res => res.json());
  console.log('NFT metadata:', metadata);

  return {
    tokenId: nft.current_token_data.token_name,
    tokenUri: nft.current_token_data.token_uri,
    metadata
  };
} 