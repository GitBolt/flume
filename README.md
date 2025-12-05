<p align="center">
  <img
    alt="Flume"
    src="./public/og.png"
    width="160"
  />
</p>

# Flume

Flume is a visual automation board for Solana. You drop your wallet assets onto a canvas that looks like an iPhone home screen, describe the DeFi sequence you want, and Flume wires the swaps, transfers, stakes, and on-chain checks into a single executable flow.


## Product Overview

| Step | What the user sees | What happens under the hood |
| --- | --- | --- |
| 1. Connect wallet | Phantom modal, then the canvas fills with icons for SOL, SPL tokens, and NFTs | `/services/moralis.ts` fetches the portfolio and `pages/index.tsx` creates wallet/token/NFT nodes |
| 2. Organize assets | Drag icons around or drop them onto each other to create folders | Node drag handler merges nodes, stores folder metadata, and keeps Moralis payloads on each node |
| 3. Describe a flow | Press `Cmd/Ctrl + K` and type natural language instructions | `CommandPalette` sends the prompt + live balances to `pages/api/generate-flow.ts`, which uses GPT‑4o to emit ordered action configs |
| 4. Run it | Info sidebar highlights connected action nodes; click “Run Flow” | `InfoSidebar` gathers upstream assets, builds a Solana Agent Kit, executes each `SendAIActionType`, and appends animated `ActionResult` nodes |

The core value: everything stays on one canvas. Assets, AI-generated actions, manual tweaks, and execution feedback all live in the same visual context.

## Core Features

- **AI Flow Generator**: `src/components/CommandPalette.tsx` posts prompts plus live balances to `pages/api/generate-flow.ts`, which constrains GPT-4o to the supported `SendAIActionType` list and enforces real numeric calculations (no placeholders).
- **SendAI Action Nodes**: `src/nodes/SendAI/DeFiActionNode.tsx` renders any action defined in `util/sendaiActions.ts`, surfaces editable configs, detects upstream assets via handles, and runs actions against Solana Agent Kit with automatic result-node fan-out.
- **Portfolio Canvas**: `pages/index.tsx` + `services/moralis.ts` auto-build wallet, token, and NFT nodes; `nodes/Portfolio/*` handle visuals. Drag-to-folder logic exists inline in the page to mimic iOS behavior.
- **Flow Execution Surface**: `components/InfoSidebar.tsx` inspects the graph, orders connected action nodes left→right, bundles upstream tokens via `util/assets.ts`, and streams them through `runSendAIAction`. Every run attaches structured feedback (status, signature, return data).
- **React Flow Editing Enhancements**: `layouts/Playground.tsx` enforces asset payload propagation, custom edge rendering (`NodeEdge`), minimap/controls styling, and `Backspace` protections to avoid accidental asset deletion.
- **Contextual System**: `_app.tsx` wraps the tree with Wallet, ReactFlow, Theme, Config (network), Portfolio, and Modal providers so data, theming, and AI state remain consistent across components.

## Architecture

| Layer | Responsibility | Key Files |
| --- | --- | --- |
| UI Shell | Branding, navbar, sidebars, theme switching | `layouts/Navbar.tsx`, `layouts/Sidebar.tsx`, `components/Branding.tsx`, `components/ThemeSwitcher.tsx` |
| Canvas Engine | React Flow configuration, custom handles, node registry | `layouts/Playground.tsx`, `layouts/CustomHandle.tsx`, `layouts/NodeEdge.tsx`, `nodes/index.ts` |
| Node Library | Portfolio nodes (wallet/tokens/NFTs/folders/results) + dynamic SendAI nodes | `src/nodes/Portfolio/*`, `src/nodes/SendAI/DeFiActionNode.tsx` |
| AI + Automation | Flow generator API, SendAI actions, agent bootstrap, asset extraction helpers | `pages/api/generate-flow.ts`, `util/sendaiActions.ts`, `util/agent.ts`, `util/assets.ts` |
| Data + State | Moralis integration, contexts for wallet/network/modals/portfolio, helper utils | `services/moralis.ts`, `context/*`, `util/*` |

**Tech Stack**

- Next.js 14 (App Router not in use; classic `pages/` directory).
- Chakra UI for the component system + theming.
- React Flow v11 for node/edge orchestration.
- Solana Agent Kit + plugins (`plugin-token`, `plugin-defi` placeholder) for execution.
- Moralis Portfolio API for asset discovery.
- OpenAI GPT-4o via the Vercel AI SDK for natural language flow authoring.

## Node System

| Category | Nodes | Purpose |
| --- | --- | --- |
| Portfolio | `walletBalance`, `tokenCard`, `nftCard`, `folder`, `actionResult` | Visualize holdings, group them, and display execution feedback. Wallet + tokens can feed balances into action nodes through custom handles. |
| SendAI Actions | Generated from `ACTION_DEFINITIONS` (Jupiter, Drift, Solayer, Pump.fun, Sanctum, Solana core, etc.) | Each action type mounts `DeFiActionNode` with a label, emoji, config panel, and run controls. The list is centrally defined so adding a new action is metadata-driven. |
| Execution Feedback | `ActionResult` nodes | Created on success/failure from both DeFi nodes and InfoSidebar runs; show status badges, timestamps, Solscan links, and optional structured return data. |

**Handles & Data Flow**

- `layouts/CustomHandle.tsx` styles React Flow handles.
- `buildAssetPayload` converts source nodes into a structured payload (`kind: token/nft/folder`) stored on the target node's `data` keyed by source node id, letting downstream nodes introspect upstream attachments.
- DeFi nodes read `data[sourceNodeId]` to derive `FlowToken` inputs; InfoSidebar replicates this logic to gather tokens when executing the entire flow sequentially.

## AI Flow Generation

1. User presses `Cmd/Ctrl + K`.
2. `CommandPalette` collects the prompt and current `portfolioContext`, then calls `/api/generate-flow`.
3. `generate-flow.ts` assembles a deterministic system prompt containing the supported action catalog, numeric-calculation rules, and token mints, then calls GPT-4o via Vercel AI SDK (`generateText`).
4. The API strips markdown fences, validates the JSON array, and responds with `steps`.
5. The palette places the nodes to the right of existing content, connects them with animated edges, and injects each `step.config` into the node data.

## Running a Flow

1. Connect your wallet using the navbar button (Phantom adapter).
2. Drop asset nodes onto SendAI nodes by drawing edges; the target node records upstream payloads per handle.
3. Configure any action-specific parameters inside the node body or via the modal.
4. Open the Info sidebar and click **Run Flow**. The sidebar:
   - Sorts connected action nodes by `position.x`.
   - For each node, builds the latest token set (`extractAssetsFromNodeData`).
   - Creates a Solana Agent Kit instance bound to your adapter wallet + active RPC (`HELIUS_MAINNET_RPC` fallback).
   - Calls `runSendAIAction`, which picks the right action signature, normalizes config keys, and forwards the request to the agent.
   - On success/error, appends an `ActionResult` node to the right with animated edges.

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
OPENAI_API_KEY=server_side_openai_key           # used by /api/generate-flow
NEXT_PUBLIC_DEFAULT_RPC=https://your-rpc.com    # optional, defaults to HELIUS endpoint in util/constants.ts
NEXT_PUBLIC_JUPITER_REFERRAL_ACCOUNT=optional_jup_referral
NEXT_PUBLIC_JUPITER_FEE_BPS=0                   # optional referral fee
NEXT_PUBLIC_PINATA_JWT=optional_pinata_jwt      # used by some agent actions
```
