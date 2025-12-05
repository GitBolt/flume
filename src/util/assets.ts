import { Node } from 'reactflow';
import { MoralisNFT, MoralisToken } from '@/services/moralis';

export type FlowToken = Pick<MoralisToken, 'mint' | 'symbol' | 'decimals' | 'logo'> & {
  amount: string;
  name?: string;
};

export type AssetPayload =
  | { kind: 'token'; token: FlowToken }
  | { kind: 'nft'; nft: MoralisNFT }
  | { kind: 'folder'; tokens: FlowToken[]; nfts: MoralisNFT[]; name: string };

export type AttachedAsset = AssetPayload & { source: string };

export const SOL_MINT = 'So11111111111111111111111111111111111111112';

export const toFlowToken = (token: MoralisToken): FlowToken => ({
  amount: token.amount,
  decimals: token.decimals,
  logo: token.logo,
  mint: token.mint,
  name: token.name,
  symbol: token.symbol,
});

export const buildAssetPayload = (node: Node): AssetPayload | null => {
  if (node.type === 'tokenCard' && node.data) {
    return { kind: 'token', token: toFlowToken(node.data as MoralisToken) };
  }

  if (node.type === 'walletBalance' && node.data) {
    const solAmount = typeof node.data.solana === 'string' ? node.data.solana : String(node.data.solana || 0);
    return {
      kind: 'token',
      token: {
        amount: solAmount,
        decimals: 9,
        mint: SOL_MINT,
        symbol: 'SOL',
        name: 'Solana',
      },
    };
  }

  if (node.type === 'nftCard' && node.data) {
    return { kind: 'nft', nft: node.data as MoralisNFT };
  }

  if (node.type === 'folder' && node.data) {
    const { apps = [], name = 'Folder' } = node.data as any;
    const tokens: FlowToken[] = [];
    const nfts: MoralisNFT[] = [];

    apps.forEach((app: any) => {
      if (app.type === 'tokenCard' && app.data) {
        tokens.push(toFlowToken(app.data as MoralisToken));
      }
      if (app.type === 'walletBalance' && app.data) {
        tokens.push({
          amount: app.data.solana,
          decimals: 9,
          mint: SOL_MINT,
          symbol: 'SOL',
          name: 'Solana',
        });
      }
      if (app.type === 'nftCard' && app.data) {
        nfts.push(app.data as MoralisNFT);
      }
    });

    return { kind: 'folder', tokens, nfts, name };
  }

  return null;
};

export const isAssetPayload = (value: any): value is AssetPayload => {
  if (!value || typeof value !== 'object') return false;
  return value.kind === 'token' || value.kind === 'nft' || value.kind === 'folder';
};

export const extractAssetsFromNodeData = (data: Record<string, any>): AttachedAsset[] => {
  return Object.entries(data)
    .filter(([, value]) => isAssetPayload(value))
    .map(([source, value]) => ({ ...value, source }));
};
