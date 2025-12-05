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
  // Jupiter
  { type: 'fetchPrice', label: 'Fetch Price', category: 'Jupiter' },
  { type: 'stakeWithJup', label: 'Stake with Jupiter', category: 'Jupiter' },
  { type: 'trade', label: 'Trade', category: 'Jupiter' },
  { type: 'createLimitOrder', label: 'Create Limit Order', category: 'Jupiter' },
  { type: 'cancelLimitOrders', label: 'Cancel Limit Orders', category: 'Jupiter' },
  { type: 'getOpenLimitOrders', label: 'Get Open Limit Orders', category: 'Jupiter' },
  { type: 'getLimitOrderHistory', label: 'Get Limit Order History', category: 'Jupiter' },
  // Token plugin
  { type: 'getTokenDataByAddress', label: 'Token Data by Address', category: 'Tokens' },
  { type: 'getTokenByTicker', label: 'Get Token by Ticker', category: 'Tokens' },
  // Solana core
  { type: 'closeEmptyTokenAccounts', label: 'Close Empty Token Accounts', category: 'Solana' },
  { type: 'getTPS', label: 'Get TPS', category: 'Solana' },
  { type: 'get_balance', label: 'Get Balance', category: 'Solana' },
  { type: 'get_token_balance', label: 'Get Token Balance', category: 'Solana' },
  { type: 'request_faucet_funds', label: 'Request Faucet Funds', category: 'Solana' },
  { type: 'transfer', label: 'Transfer', category: 'Solana' },
  { type: 'getWalletAddress', label: 'Get Wallet Address', category: 'Solana' },
  { type: 'compressedAirdrop', label: 'Compressed Airdrop', category: 'Solana' },
  // Mayan
  { type: 'swap', label: 'Swap', category: 'Mayan' },
  // Pumpfun
  { type: 'launchPumpFunToken', label: 'Launch Pump.fun Token', category: 'Pumpfun' },
  { type: 'claimPumpFunCreatorFee', label: 'Claim Pump.fun Creator Fee', category: 'Pumpfun' },
  // Pyth
  { type: 'fetchPythPrice', label: 'Pyth Price', category: 'Pyth' },
  // Rugcheck
  { type: 'rugcheck', label: 'Rugcheck', category: 'Rugcheck' },
  // Solutiofi
  { type: 'burnTokens', label: 'Burn Tokens', category: 'Solutiofi' },
  { type: 'closeAccounts', label: 'Close Accounts', category: 'Solutiofi' },
  { type: 'mergeTokens', label: 'Merge Tokens', category: 'Solutiofi' },
  { type: 'spreadToken', label: 'Spread Token', category: 'Solutiofi' },
  // Solayer
  { type: 'stakeWithSolayer', label: 'Stake with Solayer', category: 'Solayer' },
  // Drift
  { type: 'driftPerpTrade', label: 'Drift Perp Trade', category: 'Drift' },
  { type: 'createDriftUserAccount', label: 'Create Drift Account', category: 'Drift' },
  { type: 'createDriftVault', label: 'Create Drift Vault', category: 'Drift' },
  { type: 'depositIntoDriftVault', label: 'Deposit into Drift Vault', category: 'Drift' },
  { type: 'withdrawFromDriftVault', label: 'Withdraw from Drift Vault', category: 'Drift' },
  // Voltr
  { type: 'voltrGetPositionValues', label: 'Voltr Position Values', category: 'Voltr' },
  { type: 'voltrDepositStrategy', label: 'Voltr Deposit', category: 'Voltr' },
  { type: 'voltrWithdrawStrategy', label: 'Voltr Withdraw', category: 'Voltr' },
  // Sanctum
  { type: 'sanctumSwapLST', label: 'Sanctum Swap LST', category: 'Sanctum' },
  { type: 'sanctumAddLiquidity', label: 'Sanctum Add Liquidity', category: 'Sanctum' },
  { type: 'sanctumRemoveLiquidity', label: 'Sanctum Remove Liquidity', category: 'Sanctum' },
  { type: 'sanctumGetLSTAPY', label: 'Sanctum LST APY', category: 'Sanctum' },
  { type: 'sanctumGetLSTPrice', label: 'Sanctum LST Price', category: 'Sanctum' },
  { type: 'sanctumGetLSTTVL', label: 'Sanctum LST TVL', category: 'Sanctum' },
  { type: 'sanctumGetOwnedLST', label: 'Sanctum Owned LST', category: 'Sanctum' },
];

export const getActionLabel = (type: string) =>
  ACTION_DEFINITIONS.find((a) => a.type === type)?.label || type;

/**
 * Manual mappings for actions where the naming doesn't follow standard conventions
 */
const ACTION_NAME_MAPPING: Record<string, string> = {
  'launchPumpFunToken': 'LAUNCH_PUMPFUN_TOKEN',
  'claimPumpFunCreatorFee': 'CLAIM_PUMPFUN_CREATOR_FEE',
  'stakeWithJup': 'STAKE_WITH_JUPITER',
};

/**
 * Converts camelCase to UPPER_SNAKE_CASE with intelligent handling
 * Automatically handles common patterns like:
 * - Compound words (PumpFun -> PUMPFUN)
 * - Abbreviations (Jup -> JUPITER, LST -> LST)
 * - Multi-word patterns (stakeWithJup -> STAKE_WITH_JUPITER)
 */
const camelToUpperSnake = (str: string): string => {
  // Check manual mapping first
  if (ACTION_NAME_MAPPING[str]) {
    return ACTION_NAME_MAPPING[str];
  }
  
  // Common abbreviation expansions
  const abbreviations: Record<string, string> = {
    'Jup': 'JUPITER',
    'API': 'API',
    'LST': 'LST',
    'NFT': 'NFT',
    'DeFi': 'DEFI',
    'TPS': 'TPS',
  };
  
  // Compound words that should stay together
  const compounds = ['PumpFun', 'Pumpfun', 'pumpFun'];
  
  let result = str;
  
  // Handle compound words
  compounds.forEach(compound => {
    result = result.replace(new RegExp(compound, 'gi'), 'PUMPFUN');
  });
  
  // Expand abbreviations
  Object.entries(abbreviations).forEach(([abbr, full]) => {
    result = result.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
  });
  
  // Convert to UPPER_SNAKE_CASE
  return result
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '')
    .replace(/_+/g, '_');
};

/**
 * Converts camelCase to snake_case
 * Example: "stakeWithSolayer" -> "stake_with_solayer"
 */
const camelToSnake = (str: string): string => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

/**
 * Finds an action in the agent by trying multiple naming conventions
 * Uses intelligent matching that handles abbreviations, compounds, and case variations
 */
const findActionByName = (agent: SolanaAgentKit, type: string) => {
  // Check manual mapping first
  const mappedName = ACTION_NAME_MAPPING[type];
  if (mappedName) {
    const action = agent.actions.find((a) => a.name === mappedName);
    if (action) return action;
  }
  
  const typeLower = type.toLowerCase();
  const typeUpperSnake = camelToUpperSnake(type);
  const typeSnake = camelToSnake(type);
  
  return agent.actions.find((a) => {
    const actionName = a.name || '';
    const actionNameLower = actionName.toLowerCase();
    
    // Direct match (case-insensitive)
    if (actionNameLower === typeLower) return true;
    
    // UPPER_SNAKE_CASE match
    if (actionName === typeUpperSnake || actionNameLower === typeUpperSnake.toLowerCase()) return true;
    
    // snake_case match
    if (actionNameLower === typeSnake) return true;
    
    // Check similes
    if (a.similes?.some((s: string) => {
      const sLower = s.toLowerCase();
      return sLower === typeLower || sLower === typeSnake || sLower === typeUpperSnake.toLowerCase();
    })) return true;
    
    // Normalized match - remove underscores and compare
    const actionNameNormalized = actionNameLower.replace(/_/g, '');
    const typeNormalized = typeLower.replace(/_/g, '');
    if (actionNameNormalized === typeNormalized) return true;
    
    return false;
  });
};

/**
 * Debug helper to get all available action names from an agent
 */
export const getAvailableActions = (agent: SolanaAgentKit): string[] => {
  return agent.actions
    .map((a) => a.name)
    .filter((n): n is string => !!n);
};

export const runSendAIAction = async (
  type: SendAIActionType,
  tokens: FlowToken[],
  config: ActionConfig,
  agent: SolanaAgentKit
) => {
  const action = findActionByName(agent, type);

  if (!action) {
    const availableActions = getAvailableActions(agent);
    const isDefined = ACTION_DEFINITIONS.some((a) => a.type === type);
    const suggestion = isDefined
      ? `\nThis action is defined but not available in the current SolanaAgentKit version.`
      : '\nThis action is not defined in the system.';
    
    throw new Error(
      `Action "${type}" is unavailable.${suggestion}\nAvailable actions: ${availableActions.slice(0, 10).join(', ')}...`
    );
  }

  let payload: Record<string, any> = {
    ...config,
    tokens: config?.tokens || tokens,
  };

  // Standardized field name mapping - applies common aliases automatically
  const standardFieldAliases: Record<string, string[]> = {
    'tokenName': ['name', 'token_name', 'token'],
    'tokenTicker': ['symbol', 'ticker', 'token_ticker'],
    'description': ['desc', 'details'],
    'imageUrl': ['image', 'url', 'img', 'image_url'],
    'twitter': ['x', 'twitter_handle'],
    'telegram': ['tg', 'telegram_link'],
    'website': ['site', 'web'],
  };

  // Apply standardized field mappings
  const mappedPayload: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    let mapped = false;
    // Check if this key is an alias for a standard field
    for (const [standardField, aliases] of Object.entries(standardFieldAliases)) {
      if (aliases.includes(key.toLowerCase()) || key === standardField) {
        mappedPayload[standardField] = value;
        mapped = true;
        break;
      }
    }
    if (!mapped) {
      mappedPayload[key] = value;
    }
  }
  payload = mappedPayload;

  try {
    // Try to validate payload against schema before executing
    if (action.schema) {
      const zodSchema = action.schema as any;
      try {
        zodSchema.parse(payload);
      } catch (validationError: any) {
        // Extract Zod validation errors
        const zodErrors = validationError.errors || validationError.issues;
        if (zodErrors && Array.isArray(zodErrors)) {
          const missingFields = zodErrors
            .filter((e: any) => e.code === 'invalid_type' && e.received === 'undefined')
            .map((e: any) => e.path.join('.'));
          
          // Auto-generate intelligent defaults for common field types
          if (missingFields.length > 0) {
            const generateDefault = (field: string): any => {
              if (field.includes('Name') || field.includes('name')) return 'Unnamed';
              if (field.includes('Ticker') || field.includes('symbol')) return 'TKN';
              if (field.includes('description') || field.includes('desc')) return 'No description provided';
              if (field.includes('Url') || field.includes('url') || field.includes('image')) return 'https://via.placeholder.com/512';
              if (field.includes('twitter') || field.includes('telegram') || field.includes('website')) return '';
              return '';
            };
            
            // Apply defaults for missing fields
            missingFields.forEach(field => {
              payload[field] = generateDefault(field);
            });
            
            // Try validation again with defaults
            try {
              zodSchema.parse(payload);
            } catch (retryError: any) {
              const retryErrors = retryError.errors || retryError.issues;
              const invalidFields = retryErrors
                ?.filter((e: any) => e.code !== 'invalid_type' || e.received !== 'undefined')
                .map((e: any) => ({
                  field: e.path.join('.'),
                  message: e.message,
                })) || [];
              
              const stillMissing = retryErrors
                ?.filter((e: any) => e.code === 'invalid_type' && e.received === 'undefined')
                .map((e: any) => e.path.join('.')) || [];
              
              let errorMsg = `Validation failed for "${type}":\n`;
              if (stillMissing.length > 0) errorMsg += `Missing: ${stillMissing.join(', ')}\n`;
              if (invalidFields.length > 0) errorMsg += `Invalid:\n${invalidFields.map((f: any) => `  ${f.field}: ${f.message}`).join('\n')}`;
              
              throw new Error(errorMsg);
            }
          } else {
            const invalidFields = zodErrors
              .filter((e: any) => e.code !== 'invalid_type' || e.received !== 'undefined')
              .map((e: any) => ({
                field: e.path.join('.'),
                message: e.message,
              }));
            
            if (invalidFields.length > 0) {
              throw new Error(
                `Validation failed for "${type}":\n${invalidFields.map((f: any) => `  ${f.field}: ${f.message}`).join('\n')}`
              );
            }
          }
        } else {
          throw validationError;
        }
      }
    }
    
    const res = await executeAction(action as any, agent, payload);
    if (res?.status && res.status !== 'success') {
      throw new Error(res.message || `Action "${type}" failed`);
    }
    return res;
  } catch (error: any) {
    if (error.message?.includes('Validation failed')) {
      throw error;
    }
    throw error;
  }
};
