import { SolanaAgentKit, executeAction } from 'solana-agent-kit';
import { FlowToken } from './assets';

export type SendAIActionType = string;

export type ActionConfig = Record<string, any>;

export const DEFAULT_OUTPUT_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export type ActionDefinition = {
  type: string;
  label: string;
  category: string;
};

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  // Adrena
  { type: 'openPerpTradeLong', label: 'Adrena Long', category: 'Adrena' },
  { type: 'openPerpTradeShort', label: 'Adrena Short', category: 'Adrena' },
  { type: 'closePerpTradeLong', label: 'Close Adrena Long', category: 'Adrena' },
  { type: 'closePerpTradeShort', label: 'Close Adrena Short', category: 'Adrena' },
  // Flash
  { type: 'flashOpenTrade', label: 'Flash Open Trade', category: 'Flash' },
  { type: 'flashCloseTrade', label: 'Flash Close Trade', category: 'Flash' },
  // Drift
  { type: 'driftPerpTrade', label: 'Drift Perp Trade', category: 'Drift' },
  { type: 'calculatePerpMarketFundingRate', label: 'Drift Funding Rate', category: 'Drift' },
  { type: 'createVault', label: 'Drift Create Vault', category: 'Drift' },
  { type: 'createDriftUserAccount', label: 'Drift User Account', category: 'Drift' },
  { type: 'depositIntoVault', label: 'Drift Deposit Vault', category: 'Drift' },
  { type: 'withdrawFromDriftVault', label: 'Drift Withdraw Vault', category: 'Drift' },
  { type: 'stakeToDriftInsuranceFund', label: 'Drift Insurance Stake', category: 'Drift' },
  // Openbook
  { type: 'openbookCreateMarket', label: 'OpenBook Create Market', category: 'OpenBook' },
  // Fluxbeam
  { type: 'fluxBeamCreatePool', label: 'FluxBeam Create Pool', category: 'FluxBeam' },
  // Orca
  { type: 'orcaClosePosition', label: 'Orca Close Position', category: 'Orca' },
  { type: 'orcaCreateCLMM', label: 'Orca Create CLMM', category: 'Orca' },
  { type: 'orcaOpenCenteredPositionWithLiquidity', label: 'Orca Centered Position', category: 'Orca' },
  { type: 'orcaCreateClmm', label: 'Orca Create CLMM (Legacy)', category: 'Orca' },
  // Raydium
  { type: 'raydiumCreateAmmV4', label: 'Raydium AMM V4', category: 'Raydium' },
  { type: 'raydiumCreateClmm', label: 'Raydium Create CLMM', category: 'Raydium' },
  { type: 'raydiumCreateCpmm', label: 'Raydium Create CPMM', category: 'Raydium' },
  { type: 'raydiumCreateLaunchlabToken', label: 'Raydium Launch Token', category: 'Raydium' },
  // Solayer
  { type: 'stakeWithSolayer', label: 'Stake with Solayer', category: 'Solayer' },
  // Voltr
  { type: 'voltrDepositStrategy', label: 'Voltr Deposit', category: 'Voltr' },
  { type: 'voltrGetPositionValues', label: 'Voltr Position Values', category: 'Voltr' },
  // Sanctum
  { type: 'sanctumSwapLST', label: 'Sanctum Swap LST', category: 'Sanctum' },
  { type: 'sanctumAddLiquidity', label: 'Sanctum Add Liquidity', category: 'Sanctum' },
  { type: 'sanctumRemoveLiquidity', label: 'Sanctum Remove Liquidity', category: 'Sanctum' },
  { type: 'sanctumGetLSTAPY', label: 'Sanctum LST APY', category: 'Sanctum' },
  { type: 'sanctumGetLSTPrice', label: 'Sanctum LST Price', category: 'Sanctum' },
  { type: 'sanctumGetLSTTVL', label: 'Sanctum LST TVL', category: 'Sanctum' },
  { type: 'sanctumGetOwnedLST', label: 'Sanctum Owned LST', category: 'Sanctum' },
  // Jupiter
  { type: 'fetchPrice', label: 'Fetch Price (Jup)', category: 'Jupiter' },
  { type: 'stakeWithJup', label: 'Stake with Jup', category: 'Jupiter' },
  { type: 'trade', label: 'Trade (Jup)', category: 'Jupiter' },
  { type: 'getTokenByTicker', label: 'Get Token by Ticker', category: 'Jupiter' },
  // Token plugin
  { type: 'getTokenDataByAddress', label: 'Token Data by Address', category: 'Tokens' },
  { type: 'getTokenAddressFromTicker', label: 'Token Address from Ticker', category: 'Tokens' },
  // Solana core
  { type: 'closeEmptyTokenAccounts', label: 'Close Empty Token Accounts', category: 'Solana' },
  { type: 'getTPS', label: 'Get TPS', category: 'Solana' },
  { type: 'get_balance', label: 'Get Balance', category: 'Solana' },
  { type: 'get_balance_other', label: 'Get Balance (Other)', category: 'Solana' },
  { type: 'get_token_balance', label: 'Get Token Balance', category: 'Solana' },
  { type: 'request_faucet_funds', label: 'Request Faucet Funds', category: 'Solana' },
  { type: 'transfer', label: 'Transfer', category: 'Solana' },
  { type: 'getWalletAddress', label: 'Get Wallet Address', category: 'Solana' },
  // Mayan
  { type: 'swap', label: 'Mayan Swap', category: 'Mayan' },
  // Pumpfun
  { type: 'launchPumpFunToken', label: 'Launch Pump.fun Token', category: 'Pumpfun' },
  // Pyth
  { type: 'fetchPythPrice', label: 'Pyth Price', category: 'Pyth' },
  { type: 'fetchPythPriceFeedID', label: 'Pyth Price Feed ID', category: 'Pyth' },
  // Rugcheck
  { type: 'fetchTokenDetailedReport', label: 'Rugcheck Detailed Report', category: 'Rugcheck' },
  { type: 'fetchTokenReportSummary', label: 'Rugcheck Report Summary', category: 'Rugcheck' },
  // Solutiofi
  { type: 'burnTokens', label: 'Burn Tokens', category: 'Solutiofi' },
  { type: 'closeAccounts', label: 'Close Accounts', category: 'Solutiofi' },
  { type: 'mergeTokens', label: 'Merge Tokens', category: 'Solutiofi' },
  { type: 'spreadToken', label: 'Spread Token', category: 'Solutiofi' },
];

export const getActionLabel = (type: string) =>
  ACTION_DEFINITIONS.find((a) => a.type === type)?.label || type;

export const runSendAIAction = async (
  type: SendAIActionType,
  tokens: FlowToken[],
  config: ActionConfig,
  agent: SolanaAgentKit
) => {
  const action = agent.actions.find(
    (a) => a.name?.toLowerCase() === type.toLowerCase() || a.similes?.some((s: string) => s.toLowerCase() === type.toLowerCase())
  );

  if (!action) {
    throw new Error(`Action "${type}" is unavailable on this agent`);
  }

  const payload = {
    ...config,
    tokens: config?.tokens || tokens,
  };

  const res = await executeAction(action as any, agent, payload);
  if (res?.status && res.status !== 'success') {
    throw new Error(res.message || `Action "${type}" failed`);
  }
  return res;
};
