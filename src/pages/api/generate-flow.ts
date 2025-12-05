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
4. "assetSource": optional, which previous step's output to use as input (e.g., "step1" or "portfolio")

For token operations:
- SOL mint: So11111111111111111111111111111111111111112
- USDC mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
- USDT mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB

Common patterns:
1. Swap: Use "trade" action with outputMint, inputAmount
2. Stake: Use "stakeWithJup" action with amount
3. Lend: Use appropriate protocol's deposit action (e.g., "voltrDepositStrategy")
4. Get balance: Use "get_balance" or "get_token_balance"

Example: "convert 50% of my solana into usdc and lend it on jupiter"
Response:
[
  {
    "action": "get_balance",
    "config": {},
    "description": "Get current SOL balance",
    "assetSource": "portfolio"
  },
  {
    "action": "trade",
    "config": {
      "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "inputAmount": "CALCULATE_50_PERCENT",
      "slippageBps": 50
    },
    "description": "Swap 50% of SOL to USDC using Jupiter",
    "assetSource": "step1"
  },
  {
    "action": "stakeWithJup",
    "config": {
      "amount": "FROM_PREVIOUS_OUTPUT"
    },
    "description": "Stake/Lend USDC on Jupiter",
    "assetSource": "step2"
  }
]

IMPORTANT: 
- Always respond with a valid JSON array only, no markdown, no explanations
- Use exact action types from the available actions list
- If an action doesn't exist, suggest the closest alternative
- For percentage calculations, use descriptive placeholders like "CALCULATE_50_PERCENT"
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
      userAssetsContext = `\n\nUser's Current Assets:\n`;
      userAssetsContext += `- SOL: ${userAssets.sol}\n`;
      if (userAssets.tokens && userAssets.tokens.length > 0) {
        userAssetsContext += `- Tokens:\n`;
        userAssets.tokens.forEach((t: any) => {
          userAssetsContext += `  * ${t.symbol} (${t.mint}): ${t.amount} (${t.decimals} decimals)\n`;
        });
      }
      userAssetsContext += `\nYou can reference these assets directly. For example, if user wants to swap "100 USDC", use the USDC from their tokens. Don't use get_balance actions unless specifically needed.`;
    }

    const result = await generateText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT + userAssetsContext,
      prompt: prompt,
      temperature: 0.3,
      maxTokens: 2000,
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

