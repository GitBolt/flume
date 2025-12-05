import { createContext, useState, useContext } from 'react';
import { ReactNode } from 'react';
import { HELIUS_MAINNET_RPC } from '@/util/constants';

interface NetworkContextValue {
  selectedNetwork: string;
  updateNetwork: (network: string) => void;
}

const NetworkContext = createContext<NetworkContextValue>({
  selectedNetwork: HELIUS_MAINNET_RPC,
  updateNetwork: () => { },
});

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>(HELIUS_MAINNET_RPC);


  const updateNetwork = (network: string) => {
    setSelectedNetwork(network);
  };

  return (
    <NetworkContext.Provider
      value={{
        selectedNetwork,
        updateNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => {
  return useContext(NetworkContext);
};
