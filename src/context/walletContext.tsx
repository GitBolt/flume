
import React, { FC, useMemo } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { HELIUS_MAINNET_RPC } from '@/util/constants';


type Props = {
  children?: React.ReactNode;
};

export const Wallet: FC<Props> = ({ children }: Props) => {
  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(() => HELIUS_MAINNET_RPC, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
