<p align="center">
  <img
    alt="Flume"
    src="./public/og.png"
    width="160"
  />
</p>

# Flume


Flume is a Solana learning playground that lets you explore and build without writing code. Everything now runs locally in the browser: no multiplayer, no cloud saves, no remote database.

## How does it work?
It provides a user-friendly, no-code environment where users can create nodes for various actions, such as string input, token transfers, fetching token details, generating keypairs, and more. The nodes can be connected to each other to combine and perform various different actions.

## Code overview
This project is built with Next.js and Chakra UI, while the node-based environment utilizes the [React Flow](https://reactflow.dev) library.
The `src/nodes` folder contains all the nodes that the user can create. Each node is organized into its own file within a subfolder based on the category of actions it performs.

## Getting Started
Clone this repository and run the following commands:

```sh
yarn install
yarn dev
```

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```
NEXT_PUBLIC_MORALIS_KEY=your_moralis_api_key_here
NEXT_PUBLIC_OPENAI_KEY=your_openai_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

- Get your Moralis API key from [https://moralis.io](https://moralis.io)
- Get your OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**Note:** `OPENAI_API_KEY` is used for AI Flow Generation (server-side), while `NEXT_PUBLIC_OPENAI_KEY` is used for folder AI assistant (client-side).

## Wallet Portfolio Feature
When you connect your wallet, the application automatically fetches and displays all your assets from Solana mainnet using the Moralis API. Your portfolio will be visualized as beautiful, iPhone-style app icons in the playground:

### App Icons
- **Wallet App**: Displays your native SOL balance
- **Token Apps**: Each SPL token is shown as a simple app icon with its logo and balance
- **NFT Apps**: Each NFT is displayed as an app icon with its name

### iPhone-like Features
- **Grid Layout**: Apps are automatically arranged in a 5-column grid, just like iPhone
- **Drag to Create Folders**: Drag one app on top of another to automatically create a folder
  - Drop an app on another app to create a new folder
  - Drop an app on an existing folder to add it to that folder
  - Open folders by clicking on them to view all contained apps
- **AI Assistant for Folders**: Inside each folder, use natural language to control your assets
  - Type commands like "swap them to USDC" or "send 1 SOL to..."
  - Powered by OpenAI GPT-4 and Solana Agent Kit
  - AI automatically creates a result node showing the action status
  - Result nodes branch out from the folder showing success/error/processing states
- **Clean Background**: No distracting dots or patterns, just a clean workspace
- **Smooth Animations**: Hover and drag animations for a native app feel

The apps are automatically arranged when your wallet connects. No manual action required!

## AI Flow Generator

Press **Ctrl+K** (or **Cmd+K** on Mac) to open the AI flow generator and describe what you want to build:

### How It Works
Simply describe your DeFi workflow in natural language, and the AI will automatically generate the complete flow with all necessary nodes and connections.

**Examples of AI Flow Requests:**
- "convert 50% of my solana into usdc and lend it on jupiter"
- "swap 1 SOL to USDC then stake it"
- "get my balance and swap half to USDT"
- "buy 100 USDC worth of JUP and stake it"
- "check SOL price and if it's above 100, swap to USDC"

**Usage:**
1. Press **Ctrl+K** / **Cmd+K** to open AI generator
2. Describe your workflow in plain English
3. Press **Enter** to generate the flow
4. Review the AI-generated steps
5. Press **Enter** again or click **"Create Flow 🚀"** to add to canvas
6. Execute the flow when ready!

**Features:**
- ✨ Natural language understanding powered by GPT-4o
- 🔗 Automatically connects nodes with edges
- ⚡ Supports 90+ DeFi actions across protocols (Jupiter, Adrena, Drift, Raydium, Orca, etc.)
- 📊 Visual preview of all steps before creating
- 🎯 Smart parameter detection and configuration
- 🚀 Single interface - no separate search mode

### AI-Powered Actions
Each folder has an AI Assistant input field **directly below it on the canvas** (not inside the modal). Simply type what you want to do with your assets:

Examples:
- "Swap these tokens to USDC"
- "What can I do with these assets?"
- "Check the price of these tokens"
- "Send 0.1 SOL to [address]"

**What happens:**
1. Type your command in the input field below the folder
2. Click the → button or press Enter
3. AI analyzes your request using GPT-4o
4. A result node appears **connected by an animated edge** to your folder
5. Success = green animated edge, Error = red static edge
6. Click "View on Solscan →" to see the transaction on Solscan explorer

### Folder Management
- **Remove Apps**: Open a folder and click the red × button on any app to remove it
- **Visual Connections**: Edges automatically connect folders to their action results
- **Transaction Tracking**: Every successful action includes a Solscan link with the transaction signature

## Terminology
- **Node**: Individual blocks a user can add to the playground from the sidebar or through Command + K.
- **Edge**: The curvy magenta coloured line which connects nodes.
- **Handle**: The points through which an edge emerges or leads to. It can be either of type source (input) or target (output).

## Import Todo
In the current data sharing model, a node can output data through multiple "output handles". Each output handle is identified by a unique ID that is specific to the handle's node. When a target node wants to receive data from an output handle, it connects its "input handle" to the output handle of the source node. This connection creates an "edge" between the two nodes, which represents the flow of data from the source node to the target node.

When data is sent from the source node to the target node, it is stored in the data attribute of the target node. Specifically, the data is stored as an object with the source node's ID as the key and the output data as the value. For example, if the source node has an ID of "node-1" and it outputs data "1", the data object in the target node would look like this: { "node-1": "1" }.

The problem is when a single source node wants to output multiple values through different output handles, and these values need to be received by a single target node. Since the data object in the target node can only store one value per source node ID, it's not possible to receive multiple values from a single source node using this approach.
