import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { SolanaAgentKit, createVercelAITools } from 'solana-agent-kit';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, walletAddress, folderApps } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Set OpenAI API key in environment
    if (!process.env.NEXT_PUBLIC_OPENAI_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    // The openai provider reads from OPENAI_API_KEY env variable
    process.env.OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_KEY;

    // Create context about the folder assets
    const assetsContext = folderApps?.map((app: any) => {
      if (app.type === 'tokenCard') {
        return `${app.data.symbol} (${app.data.name}): ${app.data.amount} tokens, mint: ${app.data.mint}`;
      } else if (app.type === 'nftCard') {
        return `NFT: ${app.data.name}, mint: ${app.data.mint}`;
      } else if (app.type === 'walletBalance') {
        return `SOL Balance: ${app.data.solana} SOL`;
      }
      return '';
    }).filter(Boolean).join(', ') || 'No assets';

    // For actual transaction execution, you would:
    // 1. Get the user's wallet private key (securely)
    // 2. Initialize SolanaAgentKit with their wallet
    // 3. Use createVercelAITools to enable the AI to execute real transactions
    //
    // Example:
    // const privateKey = process.env.WALLET_PRIVATE_KEY; // Store securely!
    // const wallet = Keypair.fromSecretKey(bs58.decode(privateKey));
    // const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
    // const agent = new SolanaAgentKit(wallet, rpcUrl, process.env.NEXT_PUBLIC_OPENAI_KEY);
    // const tools = createVercelAITools(agent);
    //
    // Then pass 'tools' to generateText below

    // For now, we'll use AI to explain actions (no real transactions)
    const response = await generateText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: `You are a helpful Solana blockchain assistant. The user has a wallet at ${walletAddress} with these assets: ${assetsContext}. 
          
When the user requests an action like swapping or transferring:
1. Explain what you would do step by step
2. Provide clear details about the transaction
3. Mention the transaction signature (use format: "Transaction Signature: [SIMULATED_TX_SIG]")
4. Be concise but informative

IMPORTANT: When you explain a transaction, always include a line like:
"Transaction Signature: SIM" + random 88-character alphanumeric string

Example: If user says "swap them to USDC", respond with something like:
"I'll help you swap your tokens to USDC. Here's what happened:
1. Swapped [TOKEN_NAME] to USDC using Jupiter aggregator
2. Received approximately X USDC
3. Transaction completed successfully!
Transaction Signature: SIM5k7qd8ZxPw2vKmJ3nQqGxFpL9Rt4Wv8BhC2YuXzS6T1fD9gH3jK4mN7pR8sV5wX2yA6cE9fH2jL4mP7qS3tU5v"

Be helpful, clear, and concise.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    // Extract transaction signature from response if present
    const txSigMatch = response.text.match(/Transaction Signature:\s*([A-Za-z0-9]{87,88})/);
    const transactionSignature = txSigMatch ? txSigMatch[1] : null;

    // Extract the text response
    const result = {
      text: response.text,
      success: true,
      transactionSignature,
    };

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Agent action error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process agent action',
      success: false 
    });
  }
}

