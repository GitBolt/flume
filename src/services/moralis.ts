export interface MoralisToken {
  associatedTokenAddress: string;
  mint: string;
  amountRaw: string;
  amount: string;
  decimals: number;
  tokenStandard: number;
  name: string;
  symbol: string;
  logo: string;
  isVerifiedContract: boolean;
  possibleSpam: boolean;
}

export interface MoralisNFT {
  associatedTokenAddress: string;
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  tokenStandard: number;
  amount: string;
  amountRaw: string;
  possibleSpam: boolean;
  media: any;
}

export interface MoralisPortfolio {
  nativeBalance: {
    lamports: string;
    solana: string;
  };
  tokens: MoralisToken[];
  nfts: MoralisNFT[];
}

export const fetchWalletPortfolio = async (
  walletAddress: string
): Promise<MoralisPortfolio | null> => {
  const apiKey = process.env.NEXT_PUBLIC_MORALIS_KEY;
  
  if (!apiKey) {
    console.error('NEXT_PUBLIC_MORALIS_KEY is not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://solana-gateway.moralis.io/account/mainnet/${walletAddress}/portfolio?nftMetadata=false&mediaItems=false&excludeSpam=true`,
      {
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.status}`);
    }

    const data: MoralisPortfolio = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching wallet portfolio:', error);
    return null;
  }
};


