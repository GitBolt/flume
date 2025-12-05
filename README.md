# Flume

Flume is a visual automation board for Solana. You drop your wallet assets onto a canvas that looks like an smartphone home screen, describe the DeFi sequence you want, and Flume wires the swaps, transfers, trades, and on-chain checks into a single executable flow.

## Table of Contents

- [Flume](#flume)
  - [Table of Contents](#table-of-contents)
  - [Product Overview](#product-overview)
  - [Core Features](#core-features)
  - [Architecture](#architecture)
    - [Tech Stack](#tech-stack)
  - [Node System](#node-system)
    - [Portfolio Nodes](#portfolio-nodes)
    - [SendAI Action Nodes](#sendai-action-nodes)
    - [Execution Feedback Nodes](#execution-feedback-nodes)
    - [Handles \& Data Flow](#handles--data-flow)
  - [AI Flow Generation](#ai-flow-generation)
  - [Running a Flow](#running-a-flow)
  - [Getting Started](#getting-started)
    - [Environment Variables](#environment-variables)

## Product Overview

| Step | What the user sees | What happens under the hood |
| --- | --- | --- |
| 1. Connect wallet | Phantom modal, then the canvas fills with icons for SOL, SPL tokens, and NFTs | Portfolio service fetches wallet data and creates wallet/token/NFT nodes on the canvas |
| 2. Organize assets | Drag icons around or drop them onto each other to create folders | Node drag handler merges nodes, stores folder metadata, and preserves asset payloads on each node |
| 3. Describe a flow | Press `Cmd/Ctrl + K` and type natural language instructions | Command palette sends the prompt plus live balances to the flow generator API, which uses GPT‑4o to emit ordered action configurations |
| 4. Run it | Info sidebar highlights connected action nodes; click "Run Flow" | System gathers upstream assets, builds a Solana Agent Kit, executes each action type, and appends animated result nodes |

The core value: everything stays on one canvas. Assets, AI-generated actions, manual tweaks, and execution feedback all live in the same visual context.

## Core Features

- **AI Flow Generator**: Command palette posts prompts plus live balances to the flow generator API, which constrains GPT-4o to the supported action types and enforces real numeric calculations (no placeholders).

- **SendAI Action Nodes**: Dynamic action nodes render any defined action type, surface editable configurations, detect upstream assets via handles, and run actions against Solana Agent Kit with automatic result-node fan-out.

- **Portfolio Canvas**: Auto-builds wallet, token, and NFT nodes from connected wallet data. Drag-to-folder logic mimics smartphone home screen behavior for intuitive asset organization.

- **Flow Execution Surface**: Inspects the graph, orders connected action nodes left→right, bundles upstream tokens, and streams them through the execution engine. Every run attaches structured feedback (status, signature, return data).

- **React Flow Editing Enhancements**: Enforces asset payload propagation, custom edge rendering, minimap/controls styling, and keyboard protections to avoid accidental asset deletion.

- **Contextual System**: Wraps the application with Wallet, ReactFlow, Theme, Config (network), Portfolio, and Modal providers so data, theming, and AI state remain consistent across components.

## Architecture

| Layer | Responsibility | Key Files |
| --- | --- | --- |
| UI Shell | Branding, navbar, sidebars, theme switching | Layout and component files |
| Canvas Engine | React Flow configuration, custom handles, node registry | Playground, custom handles, edge rendering, node registry |
| Node Library | Portfolio nodes (wallet/tokens/NFTs/folders/results) + dynamic SendAI nodes | Portfolio node components, SendAI action nodes |
| AI + Automation | Flow generator API, SendAI actions, agent bootstrap, asset extraction helpers | Flow generation API, action definitions, agent utilities |
| Data + State | Moralis integration, contexts for wallet/network/modals/portfolio, helper utils | Moralis service, context providers, utility functions |

### Tech Stack

- Next.js 14 

- Chakra UI for the component system

- React Flow v11 for node/edge orchestration

- Solana Agent Kit + plugins (`plugin-token`, `plugin-defi` placeholder) for execution

- Moralis Portfolio API for asset discovery

- OpenAI GPT-4o via the Vercel AI SDK for natural language flow authoring

## Node System

### Portfolio Nodes

- **`walletBalance`**, **`tokenCard`**, **`nftCard`**, **`folder`**, **`actionResult`**: Visualize holdings, group them, and display execution feedback. Wallet + tokens can feed balances into action nodes through custom handles.

### SendAI Action Nodes

- Generated from action definitions (Jupiter, Drift, Solayer, Pump.fun, Sanctum, Solana core, etc.). Each action type mounts with a label, emoji, config panel, and run controls. The list is centrally defined so adding a new action is metadata-driven.

### Execution Feedback Nodes

- **`ActionResult`** nodes: Created on success/failure from both DeFi nodes and InfoSidebar runs; show status badges, timestamps, Solscan links, and optional structured return data.

### Handles & Data Flow

- Custom handles style React Flow connection points

- Asset payload conversion transforms source nodes into structured payloads (`kind: token/nft/folder`) stored on the target node's data, keyed by source node id, letting downstream nodes introspect upstream attachments

- DeFi nodes read node data to derive token inputs; the execution system replicates this logic to gather tokens when executing the entire flow sequentially

## AI Flow Generation

1. User presses `Cmd/Ctrl + K` to open the command palette

2. Command palette collects the prompt and current portfolio context, then calls the flow generation API

3. API assembles a deterministic system prompt containing the supported action catalog, numeric-calculation rules, and token mints, then calls GPT-4o via Vercel AI SDK

4. The API strips markdown fences, validates the JSON array, and responds with ordered steps

5. The palette places the nodes to the right of existing content, connects them with animated edges, and injects each step's configuration into the node data

## Running a Flow

1. Connect your wallet using the navbar button (Phantom adapter)

2. Drop asset nodes onto SendAI nodes by drawing edges; the target node records upstream payloads per handle

3. Configure any action-specific parameters inside the node body or via the modal

4. Open the Info sidebar and click **Run Flow**. The sidebar:
   - Sorts connected action nodes by position (left to right)
   - For each node, builds the latest token set from upstream connections
   - Creates a Solana Agent Kit instance bound to your adapter wallet + active RPC (with fallback to default endpoint)
   - Executes each action, picking the right action signature, normalizing config keys, and forwarding the request to the agent
   - On success/error, appends an `ActionResult` node to the right with animated edges

## Getting Started

```bash
yarn install
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) and connect Phantom (only mainnet RPC is wired by default).

### Environment Variables

Create `.env.local` (Next automatically loads it) with:

```
NEXT_PUBLIC_MORALIS_KEY=your_moralis_api_key
NEXT_PUBLIC_OPENAI_KEY=client_side_openai_key   # used for any client AI helpers
OPENAI_API_KEY=server_side_openai_key           # used by flow generation API
NEXT_PUBLIC_DEFAULT_RPC=https://your-rpc.com    # optional, defaults to HELIUS endpoint
NEXT_PUBLIC_JUPITER_REFERRAL_ACCOUNT=optional_jup_referral
NEXT_PUBLIC_JUPITER_FEE_BPS=0                   # optional referral fee
NEXT_PUBLIC_PINATA_JWT=optional_pinata_jwt      # used by some agent actions
```