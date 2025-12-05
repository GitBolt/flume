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
  SendOptions,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { HELIUS_MAINNET_RPC } from './constants';

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
  constructor(private readonly adapter: WalletContextState, private readonly connection: Connection) {}

  get publicKey() {
    if (!this.adapter.publicKey) {
      throw new Error('Wallet not connected');
    }
    return this.adapter.publicKey;
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
  const agent = new SolanaAgentKit(adapterWallet, rpc, {
    JUPITER_REFERRAL_ACCOUNT: process.env.NEXT_PUBLIC_JUPITER_REFERRAL_ACCOUNT,
    JUPITER_FEE_BPS: Number(process.env.NEXT_PUBLIC_JUPITER_FEE_BPS || 0),
  });

  agent.use(TokenPlugin as unknown as { actions: Action[]; methods: Record<string, any>; initialize: () => void; name: string });
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
