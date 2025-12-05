import { createContext, useContext, useState, ReactNode } from 'react';
import { MoralisToken, MoralisNFT } from '@/services/moralis';

type PortfolioData = {
  nativeBalance?: {
    solana: string;
    lamports: string;
  };
  tokens: MoralisToken[];
  nfts: MoralisNFT[];
};

type PortfolioContextType = {
  portfolio: PortfolioData | null;
  setPortfolio: (portfolio: PortfolioData | null) => void;
};

const PortfolioContext = createContext<PortfolioContextType>({
  portfolio: null,
  setPortfolio: () => {},
});

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);

  return (
    <PortfolioContext.Provider value={{ portfolio, setPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);

