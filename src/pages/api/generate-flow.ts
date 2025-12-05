import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { ACTION_DEFINITIONS } from '@/util/sendaiActions';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are an expert DeFi flow builder for Solana blockchain. Your job is to convert natural language descriptions into executable DeFi workflows.

Available actions:
${ACTION_DEFINITIONS.map((a) => `- ${a.type}: ${a.label} (${a.category})`).join('\n')}

When a user describes what they want to do, you must respond with a JSON array of steps. Each step should have:
1. "action": the exact action type from the list above
2. "config": a JSON object with parameters for that action
3. "description": human-readable description of what this step does

For token operations:
- SOL mint: So11111111111111111111111111111111111111112
- USDC mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
- USDT mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB

Common action patterns:
1. Swap: Use "trade" action with outputMint (token to get), inputAmount (number), inputMint (optional, defaults to SOL), slippageBps (optional, default 50)
2. Stake: Use "stakeWithJup" action with amount (number)
3. Get balance: Use "get_balance" for SOL or "get_token_balance" for tokens

CRITICAL CALCULATION RULES:
- You will be provided with the user's current asset balances below
- When user says "50% of my USDC", calculate the actual numeric value (amount / 2)
- When user says "100 USDC", use 100 as the inputAmount
- When user says "all my SOL", use their full SOL balance
- NEVER use placeholder strings like "CALCULATE_50_PERCENT" or "FROM_PREVIOUS_OUTPUT"
- ALWAYS calculate and provide actual numeric values
- All amounts must be NUMBERS, not strings or placeholders
- For percentages: multiply the asset amount by the percentage (e.g., 50% = amount * 0.5, 25% = amount * 0.25)

Example 1: User has 100 USDC and says "swap 50% of my USDC to SOL"
Response:
[
  {
    "action": "trade",
    "config": {
      "inputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "outputMint": "So11111111111111111111111111111111111111112",
      "inputAmount": 50,
      "slippageBps": 50
    },
    "description": "Swap 50 USDC (50% of balance) to SOL"
  }
]

Example 2: User has 5 SOL and says "convert 1 SOL into USDC and stake it"
Response:
[
  {
    "action": "trade",
    "config": {
      "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "inputAmount": 1,
      "slippageBps": 50
    },
    "description": "Swap 1 SOL to USDC"
  },
  {
    "action": "stakeWithJup",
    "config": {
      "amount": 1
    },
    "description": "Stake USDC on Jupiter"
  }
]

IMPORTANT: 
- Always respond with a valid JSON array only, no markdown, no explanations
- Use exact action types from the available actions list
- Calculate actual numeric values using the user's asset balances
- All amounts in config must be numbers, not strings or placeholders
- Keep config objects simple and relevant to the action`;

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { prompt, userAssets } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid prompt' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build user assets context for AI
    let userAssetsContext = '';
    if (userAssets) {
      userAssetsContext = `\n\n=== USER'S CURRENT PORTFOLIO ===\n`;
      userAssetsContext += `SOL Balance: ${userAssets.sol}\n`;
      if (userAssets.tokens && userAssets.tokens.length > 0) {
        userAssetsContext += `\nToken Balances:\n`;
        userAssets.tokens.forEach((t: any) => {
          userAssetsContext += `- ${t.symbol}: ${t.amount} (mint: ${t.mint}, decimals: ${t.decimals})\n`;
        });
      }
      userAssetsContext += `\n=== CALCULATION INSTRUCTIONS ===
Use these EXACT balances for your calculations:
- If user says "50% of my USDC" and they have 100 USDC, calculate: 100 * 0.5 = 50, use inputAmount: 50
- If user says "all my SOL" and they have 5 SOL, use inputAmount: 5
- If user says "1 SOL", use inputAmount: 1
- Always calculate percentages: 25% = * 0.25, 50% = * 0.5, 75% = * 0.75, 100% = * 1.0
- Round to reasonable precision (e.g., 2 decimal places for most tokens)
- NEVER use string placeholders - only real calculated numbers

You have all the data above. Do the math and provide actual numeric values in the config.`;
    }

    const result = await generateText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT + userAssetsContext,
      prompt: prompt,
      temperature: 0.3,
    });

    // Extract the text and validate it's valid JSON
    let responseText = result.text.trim();
    
    // Strip markdown code blocks if present
    if (responseText.startsWith('```')) {
      // Remove ```json or ``` at the start
      responseText = responseText.replace(/^```(?:json)?\s*\n/, '');
      // Remove trailing ```
      responseText = responseText.replace(/\n```\s*$/, '');
      responseText = responseText.trim();
    }
    
    // Try to parse to ensure it's valid JSON before sending
    try {
      const parsed = JSON.parse(responseText);
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not a JSON array');
      }
      
      // Log the generated flow for debugging
      console.log('AI generated flow:', JSON.stringify(parsed, null, 2));
      console.log('User assets provided:', JSON.stringify(userAssets, null, 2));
      
      // Validate that amounts are numbers, not strings
      parsed.forEach((step, idx) => {
        if (step.config) {
          Object.entries(step.config).forEach(([key, value]) => {
            if ((key === 'inputAmount' || key === 'amount') && typeof value === 'string') {
              console.warn(`WARNING: Step ${idx + 1} has string value for ${key}: "${value}". Should be a number.`);
            }
          });
        }
      });
      
      return new Response(
        JSON.stringify({ steps: parsed }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (parseError: any) {
      console.error('Failed to parse AI response as JSON:', responseText);
      return new Response(
        JSON.stringify({ error: 'AI returned invalid JSON format', details: responseText }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Error generating flow:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate flow' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

