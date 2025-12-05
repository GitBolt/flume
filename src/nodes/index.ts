import TokenCard from "./Portfolio/TokenCard";
import NFTCard from "./Portfolio/NFTCard";
import WalletBalance from "./Portfolio/WalletBalance";
import Folder from "./Portfolio/Folder";
import ActionResult from "./Portfolio/ActionResult";
import DeFiActionNode from "./SendAI/DeFiActionNode";
import { ACTION_DEFINITIONS } from "@/util/sendaiActions";

const actionNodeTypes = ACTION_DEFINITIONS.reduce<Record<string, typeof DeFiActionNode>>((acc, def) => {
  acc[def.type] = DeFiActionNode;
  return acc;
}, {});

export const nodeTypes = {
  tokenCard: TokenCard,
  nftCard: NFTCard,
  walletBalance: WalletBalance,
  folder: Folder,
  actionResult: ActionResult,
  ...actionNodeTypes,
};
