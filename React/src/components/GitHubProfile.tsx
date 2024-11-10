import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Book, Star, GitFork, Users, MapPin, Building, Code2, Trophy, Activity, Zap, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { IoLogoJavascript, IoLogoPython } from "react-icons/io5";
import { FaJava } from "react-icons/fa";
import { IndexerClient } from "aptos";
import Image from 'next/image';
import { mintCoin } from '../utils/aptos-utils';
import { Account } from '@aptos-labs/ts-sdk';
import { Ed25519PrivateKey } from '@aptos-labs/ts-sdk';


interface GitHubProfileProps {
  username: string;
  
}

interface GitHubData {
  name: string;
  avatar_url: string;
  bio: string;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  last_15_repositories: Array<{
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    fork: boolean;
  }>;
  top_languages: Array<{
    language: string;
    count: number;
    percentage: number;
  }>;
  developer_type: string;
  profile_readme: string | null;
}

const privateKey = new Ed25519PrivateKey(
    "0x55d8417da962242250e890c71ab846749022efa349b93e8486991173928da295"
  );
const admin = Account.fromPrivateKey({ privateKey });

export const GitHubProfile = ({ username }: GitHubProfileProps) => {
  console.log('GitHubProfile component rendered with username:', username);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sbtData, setSbtData] = useState<any>(null);
  const [hasSbt, setHasSbt] = useState(false);
  const [nftMetadata, setNftMetadata] = useState<any>(null);
  const [sbtAddress, setSbtAddress] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  // Add wallet address from localStorage
  const walletAddress = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).walletAddress : '';

  useEffect(() => {
    console.log('useEffect triggered - checking SBT and fetching data');
    const checkSbtAndFetchData = async () => {
      try {
        console.log('Checking if user has SBT for username:', username);
        const response = await fetch('/api/check-sbt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        console.log('SBT check response:', data.sbtAddress);
        setSbtAddress(data.sbtAddress);
        
        if (data.hasSbt) {
          console.log('User has SBT, fetching NFT data');
          setHasSbt(true);
        } else {
          console.log('User does not have SBT, fetching GitHub data');
          await fetchGitHubData();
        }
      } catch (err) {
        console.error('Error checking SBT status:', err);
        await fetchGitHubData();
      }
    };

    checkSbtAndFetchData();
  }, [username, walletAddress]);

  useEffect(() => {
    const autoMint = async () => {
      if (githubData && !hasSbt && !isMinting) {
        setIsMinting(true);
        try {
          console.log('Automatically triggering minting process');
          await saveAsImage();
        } catch (error) {
          console.error('Auto-minting failed:', error);
        } finally {
          setIsMinting(false);
        }
      }
    };

    autoMint();
  }, [githubData, hasSbt]);

  useEffect(() => {
    if (hasSbt && sbtAddress) {
      fetchNFTs();
    }
  }, [sbtAddress, hasSbt]);

  const fetchMetadata = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const metadata = await response.json();
      console.log('Fetched metadata:', metadata);
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return { image: '' };
    }
  };

  const fetchNFTs = async () => {
    console.log('Fetching NFTs for address:', walletAddress);
    {
      // Get sbtAddress from localStorage
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    
      console.log('SBT Address:', sbtAddress);
      console.log('Wallet Address:', walletAddress);

      const query = `
        query MyQuery {
          current_token_ownerships_v2(
            offset: 0
            where: {
              owner_address: {_eq: "${walletAddress}"},
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
        if (result.data?.current_token_ownerships_v2?.length > 0) {
          console.log('Setting SBT data');
          // Fetch metadata for the NFT
          const nft = result.data.current_token_ownerships_v2[0];
          const metadata = await fetchMetadata(nft.current_token_data.token_uri);
          setSbtData(result.data);
          setNftMetadata(metadata);
          
          console.log('NFT Metadata:', metadata);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching NFT data:', err);
        setError('Failed to fetch NFT data');
        setLoading(false);
      }
    }
  };

  

  

  const fetchGitHubData = async () => {
    console.log(`Fetching GitHub data for username: ${username}`);
    try {
      const response = await fetch(`/api/github?username=${username}`);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error fetching GitHub data:', data.message || 'Failed to fetch GitHub data');
        throw new Error(data.message || 'Failed to fetch GitHub data');
      }
      
      console.log('GitHub data fetched successfully:', data);
      setGithubData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error occurred:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('Fetch GitHub data process completed');
    }
  };

  const saveAsImage = async () => {
    console.log('Starting SBT minting process');
    if (cardRef.current === null || !githubData) {
      console.log('Missing required data - cardRef or githubData is null');
      return;
    }
    
    try {
      const { imageUrl, metadataUrl } = await uploadImageAndMetadata();
      
      const mintPayload = {
        wallet: walletAddress,
        username: username,
        nft_uri: metadataUrl,
        properties: Array.isArray(githubData.top_languages) 
          ? githubData.top_languages.map(lang => ({
              label: lang.language,
              value: lang.percentage.toString()
            }))
          : []
      };
      console.log('Preparing mint request with payload:', mintPayload);

      console.log('Initiating SBT minting transaction...');
      const mintResponse = await fetch('https://devx-flask.onrender.com/api/mint-sbt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mintPayload),
      });

      const mintResult = await mintResponse.json();
      console.log('SBT Minting transaction details:', mintResult);

      // After successful SBT minting, mint tokens
      try {
        console.log('Initiating token minting...');
        console.log('Wallet address for token minting:', walletAddress);
        console.log('Admin account for minting:', admin);
        const tokenAmount = 100;
        console.log('Token amount to mint:', tokenAmount);
        const txHash = await mintCoin(admin, walletAddress, tokenAmount);
        console.log('Token minting successful!');
        console.log('Transaction hash:', txHash);
      } catch (tokenError) {
        console.error('Token minting failed with error:', tokenError);
        console.error('Token minting error details:', tokenError instanceof Error ? tokenError.message : tokenError);
        // Continue with the flow even if token minting fails
      }
      
      // Continue with existing SBT update logic
      const updateSbtResponse = await fetch('/api/update-sbt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          sbtAddress: mintResult.collection_address
        })
      });

      const updateResult = await updateSbtResponse.json();
      console.log('SBT address updated:', updateResult);

      return {
        imageUrl,
        metadataUrl,
        mintResult
      };

    } catch (err) {
      console.error('SBT Minting failed:', err);
      console.error('Error details:', err instanceof Error ? err.message : err);
    }
  };

  const uploadImageAndMetadata = async () => {
    console.log('Starting image and metadata upload process');
    if (!githubData) {
      throw new Error('GitHub data is not available');
    }

    const dataUrl = await htmlToImage.toPng(cardRef.current!, {
      quality: 1.0,
      backgroundColor: '#1E293B',
    });
    
    console.log('Image generated, uploading to server');
    const imageResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData: dataUrl }),
    });

    const imageData = await imageResponse.json();
    console.log('Image upload response:', imageData);
    
    if (imageData.error) {
      throw new Error(imageData.error);
    }

    const metadata = {
      name: githubData.name || username,
      description: `DevX SBT for ${githubData.name || username}`,
      image: imageData.imageUrl,
      attributes: [
        {
          trait_type: "Bio",
          value: githubData.bio || ""
        },
        {
          trait_type: "Location",
          value: githubData.location || ""
        },
        {
          trait_type: "Company",
          value: githubData.company || ""
        },
        {
          trait_type: "Followers",
          value: githubData.followers
        },
        {
          trait_type: "Following",
          value: githubData.following
        },
        {
          trait_type: "Public Repositories",
          value: githubData.public_repos
        },
        {
          trait_type: "Top Languages",
          value: githubData.top_languages?.map(lang => `${lang.language} (${lang.percentage}%)`).join(", ") || ""
        },
        {
          trait_type: "Developer Type",
          value: githubData.developer_type || ""
        },
        {
          trait_type: "Last Updated",
          value: new Date().toISOString()
        }
      ]
    };

    console.log('Uploading metadata:', metadata);
    const metadataResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        jsonData: metadata
      }),
    });

    const metadataResult = await metadataResponse.json();
    console.log('Metadata upload response:', metadataResult);
    
    return {
      imageUrl: imageData.imageUrl,
      metadataUrl: metadataResult.imageUrl
    };
  };

  const getDevTypeConfig = (devType: string) => {
    console.log('Getting dev type config for:', devType);
    switch (devType) {
      case 'JSDev':
        return {
          primary: '#F7DF1E', // JavaScript Yellow
          secondary: '#323330', // JavaScript Dark
          icon: <IoLogoJavascript className="w-8 h-8" />,
          gradient: 'linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)'
        };
      case 'PythonDev':
        return {
          primary: '#3776AB', // Python Blue
          secondary: '#FFD43B', // Python Yellow
          icon: <IoLogoPython className="w-8 h-8" />,
          gradient: 'linear-gradient(145deg, #1e2936 0%, #2b3f54 100%)'
        };
      case 'JavaDev':
        return {
          primary: '#ED8B00', // Java Orange
          secondary: '#5382A1', // Java Blue
          icon: <FaJava className="w-8 h-8" />,
          gradient: 'linear-gradient(145deg, #2b2320 0%, #3d2f28 100%)'
        };
      default:
        return {
          primary: '#6D28D9',
          secondary: '#F59E0B',
          icon: null,
          gradient: 'linear-gradient(145deg, #1E293B 0%, #1E293B 100%)'
        };
    }
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="text-white text-center p-4">
        Loading...  
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="text-red-500 text-center p-4 rounded-lg bg-red-100/10">
        {error}
      </div>
    );
  }

  if (hasSbt && sbtData) {
    console.log('Rendering SBT view with data:', sbtData);
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <motion.div 
          className="rounded-xl p-6 shadow-lg border border-purple-600 bg-[#1E293B] w-full max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {sbtData?.current_token_ownerships_v2?.map((sbt: any, index: number) => (
            <div key={index}>
              {nftMetadata && nftMetadata.image && (
                <img 
                  src={nftMetadata.image}
                  width={300}
                  height={300}
                  alt={`SBT for ${sbt.current_token_data.token_name}`}
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  // Return existing GitHub profile UI if no SBT
  if (!githubData) {
    console.log('No GitHub data available, returning null');
    return null;
  }

  console.log('Rendering GitHub profile view');
  const devConfig = getDevTypeConfig(githubData.developer_type);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div 
        ref={cardRef}
        className="rounded-xl p-6 shadow-lg border border-opacity-30"
        style={{ 
          borderColor: devConfig.primary,
          background: devConfig.gradient
        }}
      >
        {/* ID Card Header */}
        <div 
          className="text-center border-b pb-4 mb-4"
          style={{ 
            borderColor: `${devConfig.primary}40`,
            background: `linear-gradient(90deg, ${devConfig.primary}10, ${devConfig.secondary}10)`
          }}
        >
          <div className="flex items-center justify-center gap-2">
            {devConfig.icon}
            <h1 className="text-lg font-bold" style={{ color: devConfig.primary }}>
               DevX Card
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* Profile Photo with updated glow color */}
          <motion.div
            className="relative mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-50"
              style={{ background: `linear-gradient(to right, ${devConfig.primary}, ${devConfig.secondary})` }}
            ></div>
            <img
              src={githubData.avatar_url}
              alt={`${githubData.name || username}'s avatar`}
              className="relative w-32 h-32 rounded-full border-4"
              style={{ borderColor: devConfig.primary }}
            />
          </motion.div>

          {/* Basic Info */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white">{githubData.name || username}</h2>
          </div>

          {/* Details Grid */}
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2 text-white">
              <Users className="w-4 h-4" style={{ color: devConfig.primary }} />
              <span className="text-gray-400">Followers/Following:</span>
              <span>{githubData.followers}/{githubData.following}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Book className="w-4 h-4" style={{ color: devConfig.primary }} />
              <span className="text-gray-400">Repositories:</span>
              <span>{githubData.public_repos}</span>
            </div>
          </div>

          {/* Language Section */}
          {githubData.top_languages?.length > 0 && (
            <div className="w-full mt-4 pt-4 border-t" style={{ borderColor: `${devConfig.primary}40` }}>
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-4 h-4" style={{ color: devConfig.primary }} />
                <span className="text-white font-semibold">Top Languages</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {githubData.top_languages.slice(0, 3).map(({ language, percentage }) => (
                  <div
                    key={language}
                    className="px-2 py-1 rounded-full text-sm"
                    style={{
                      background: `linear-gradient(145deg, ${devConfig.primary}20, ${devConfig.secondary}20)`,
                      border: `1px solid ${devConfig.primary}40`
                    }}
                  >
                    <span className="text-white">{language} </span>
                    <span className="text-gray-400">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}; 