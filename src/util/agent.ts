import TokenPlugin from '@solana-agent-kit/plugin-token';
import {
  Action,
  BaseWallet,
  SolanaAgentKit,
  executeAction,
} from 'solana-agent-kit';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  SendOptions,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { HELIUS_MAINNET_RPC } from './constants';
// import DefiPlugin from '@solana-agent-kit/plugin-defi';

type SwapParams = {
  outputMint: string;
  inputAmount: number;
  inputMint?: string;
  slippageBps?: number;
};

type StakeParams = {
  amount: number;
};

type MergeParams = {
  inputAssets: { mint: string; amount: string }[];
  outputMint: string;
  priorityFee?: 'fast' | 'turbo' | 'ultra';
};

class AdapterWallet implements BaseWallet {
  public readonly publicKey: PublicKey;
  
  constructor(private readonly adapter: WalletContextState, private readonly connection: Connection) {
    if (!adapter.publicKey) {
      throw new Error('Wallet not connected');
    }
    // Store publicKey as a property (not just a getter) for Anchor Provider compatibility
    this.publicKey = adapter.publicKey;
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (!this.adapter.signTransaction) {
      throw new Error('Wallet does not support signing transactions');
    }
    return this.adapter.signTransaction(tx);
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    if (!this.adapter.signAllTransactions) {
      throw new Error('Wallet does not support batch signing');
    }
    return this.adapter.signAllTransactions(txs);
  }

  async sendTransaction<T extends Transaction | VersionedTransaction>(tx: T) {
    return this.adapter.sendTransaction(tx, this.connection);
  }

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(tx: T, options?: SendOptions) {
    const signature = await this.adapter.sendTransaction(tx, this.connection, options);
    return { signature };
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.adapter.signMessage) {
      throw new Error('Wallet does not support message signing');
    }
    return this.adapter.signMessage(message);
  }
}

const getRpcEndpoint = (connection: Connection) => {
  const rpcFromConnection = (connection as Connection & { _rpcEndpoint?: string })._rpcEndpoint;
  return (
    rpcFromConnection ||
    (process.env.NEXT_PUBLIC_DEFAULT_RPC as string) ||
    HELIUS_MAINNET_RPC
  );
};

export const createAgent = (wallet: WalletContextState, connection: Connection) => {
  if (!wallet || !wallet.connected || !wallet.publicKey) {
    throw new Error('Connect your wallet to run SendAI actions');
  }

  const rpc = getRpcEndpoint(connection);
  const adapterWallet = new AdapterWallet(wallet, connection);
  
  // Create agent config with connection if supported
  const agentConfig: any = {
    JUPITER_REFERRAL_ACCOUNT: process.env.NEXT_PUBLIC_JUPITER_REFERRAL_ACCOUNT,
    JUPITER_FEE_BPS: Number(process.env.NEXT_PUBLIC_JUPITER_FEE_BPS || 0),
    PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT,
  };
  
  // Try to pass connection if agent supports it
  // Some plugins might need the connection object directly
  if ((SolanaAgentKit as any).prototype?.connection !== undefined) {
    agentConfig.connection = connection;
  }
  
  const agent = new SolanaAgentKit(adapterWallet, rpc, agentConfig);
  
  // Ensure the agent's wallet has publicKey accessible
  // Some plugins access agent.wallet.publicKey directly
  if (agent && (agent as any).wallet) {
    const agentWallet = (agent as any).wallet;
    if (!agentWallet.publicKey && adapterWallet.publicKey) {
      // Ensure publicKey is accessible
      Object.defineProperty(agentWallet, 'publicKey', {
        value: adapterWallet.publicKey,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }
  }
  
  // Store connection on agent for plugins that need it (like PumpFun)
  // The TokenPlugin might need access to the connection to create a proper Provider
  if (agent && connection) {
    (agent as any).connection = connection;
  }

  agent.use(TokenPlugin as unknown as { actions: Action[]; methods: Record<string, any>; initialize: () => void; name: string });
  // agent.use(DefiPlugin as unknown as { actions: Action[]; methods: Record<string, any>; initialize: () => void; name: string });
  
  // Try to fix Provider issues by ensuring the agent's internal provider has publicKey
  // The TokenPlugin might create a Provider that doesn't have publicKey accessible
  try {
    const agentAny = agent as any;
    if (agentAny.provider && !agentAny.provider.publicKey && adapterWallet.publicKey) {
      Object.defineProperty(agentAny.provider, 'publicKey', {
        value: adapterWallet.publicKey,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }
    // Also check if there's a wallet property on the provider
    if (agentAny.provider?.wallet && !agentAny.provider.wallet.publicKey && adapterWallet.publicKey) {
      Object.defineProperty(agentAny.provider.wallet, 'publicKey', {
        value: adapterWallet.publicKey,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }
  } catch (e) {
    // Ignore errors when trying to fix provider
  }
  
  // Debug: Log agent structure to help diagnose Provider issues
  if (process.env.NODE_ENV === 'development') {
    console.log('[Agent] Wallet publicKey:', adapterWallet.publicKey?.toString());
    console.log('[Agent] Agent wallet:', (agent as any).wallet);
    console.log('[Agent] Agent connection:', (agent as any).connection);
    console.log('[Agent] Agent provider:', (agent as any).provider);
  }
  
  return agent;
};

const findAction = (agent: SolanaAgentKit, name: string) => {
  const action = agent.actions.find((a) => a.name === name);
  if (!action) {
    throw new Error(`${name} action is unavailable in SendAI agent`);
  }
  return action;
};

export const executeSwap = async (agent: SolanaAgentKit, params: SwapParams) => {
  const action = findAction(agent, 'TRADE');
  return executeAction(action, agent, {
    outputMint: params.outputMint,
    inputAmount: params.inputAmount,
    ...(params.inputMint ? { inputMint: params.inputMint } : {}),
    ...(params.slippageBps ? { slippageBps: params.slippageBps } : {}),
  });
};

export const executeStake = async (agent: SolanaAgentKit, params: StakeParams) => {
  const action = findAction(agent, 'STAKE_WITH_JUPITER');
  return executeAction(action, agent, { amount: params.amount });
};

export const executeMerge = async (agent: SolanaAgentKit, params: MergeParams) => {
  const action = findAction(agent, 'SOLUTIOFI_MERGE_TOKENS');
  return executeAction(action, agent, {
    inputAssets: params.inputAssets,
    outputMint: params.outputMint,
    priorityFee: params.priorityFee || 'fast',
  });
};
