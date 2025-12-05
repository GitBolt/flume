import type { NextPage } from "next";
import Playground from "@/layouts/Playground";
import { Flex, useToast } from "@chakra-ui/react";
import Sidebar from "@/layouts/Sidebar";
import { sidebarContent } from "@/util/sidebarContent";
import { CommandPalette } from "@/components/CommandPalette";
import { Navbar } from "@/layouts/Navbar";
import { useEdgesState, useNodesState } from "reactflow";
import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchWalletPortfolio } from "@/services/moralis";
import { createNodeId } from "@/util/randomData";

const Home: NextPage = () => {

  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [pgName, setPgName] = useState<string>('Untitled')
  const [hasLoadedPortfolio, setHasLoadedPortfolio] = useState(false);
  
  const { publicKey, connected } = useWallet();
  const toast = useToast();

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!connected || !publicKey || hasLoadedPortfolio) {
        return;
      }

      try {
        const walletAddress = publicKey.toBase58();
        const portfolio = await fetchWalletPortfolio(walletAddress);

        if (!portfolio) {
          toast({
            title: 'Failed to load portfolio',
            description: 'Could not fetch wallet assets from Moralis',
            status: 'error',
            duration: 5000,
          });
          return;
        }

        // Create nodes for wallet balance, tokens, and NFTs
        const newNodes: any[] = [];
        let yPosition = 100;
        const xSpacing = 130; // iPhone-like spacing
        const ySpacing = 140;
        let xPosition = 450;
        const appsPerRow = 5; // iPhone-like grid: 5 apps per row

        // Add wallet balance node
        newNodes.push({
          id: createNodeId(),
          type: 'walletBalance',
          position: { x: xPosition, y: yPosition },
          data: portfolio.nativeBalance,
        });

        xPosition += xSpacing;

        // Add token nodes
        portfolio.tokens.forEach((token, index) => {
          const totalIndex = index + 1; // +1 for wallet balance
          if (totalIndex > 0 && totalIndex % appsPerRow === 0) {
            yPosition += ySpacing;
            xPosition = 450;
          }

          newNodes.push({
            id: createNodeId(),
            type: 'tokenCard',
            position: { x: xPosition, y: yPosition },
            data: token,
          });

          xPosition += xSpacing;
        });

        // Add NFT nodes
        portfolio.nfts.forEach((nft, index) => {
          const totalIndex = index + 1 + portfolio.tokens.length; // +1 for wallet balance
          if (totalIndex > 0 && totalIndex % appsPerRow === 0) {
            yPosition += ySpacing;
            xPosition = 450;
          }

          newNodes.push({
            id: createNodeId(),
            type: 'nftCard',
            position: { x: xPosition, y: yPosition },
            data: nft,
          });

          xPosition += xSpacing;
        });

        setNodes((existingNodes) => [...existingNodes, ...newNodes]);
        setHasLoadedPortfolio(true);
        
        toast({
          title: 'Portfolio loaded',
          description: `Loaded ${portfolio.tokens.length} tokens and ${portfolio.nfts.length} NFTs`,
          status: 'success',
          duration: 3000,
        });
      } catch (error) {
        console.error('Error loading portfolio:', error);
        toast({
          title: 'Error loading portfolio',
          status: 'error',
          duration: 5000,
        });
      }
    };

    loadPortfolio();
  }, [connected, publicKey, hasLoadedPortfolio, setNodes, toast]);

  // Reset portfolio loaded state when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setHasLoadedPortfolio(false);
    }
  }, [connected]);

  // Handle drag-to-create-folder logic
  const handleNodeDragStop = useCallback(
    (_event: any, node: any) => {
      // Check if this node was dropped on another node
      const droppedNode = node;
      const portfolioNodeTypes = ['tokenCard', 'nftCard', 'walletBalance'];
      
      // Only process portfolio nodes
      if (!portfolioNodeTypes.includes(droppedNode.type)) {
        return;
      }

      // Find if any other node is within close proximity (overlap detection)
      const overlapThreshold = 45; // Half the width of an app icon
      
      const overlappingNode = nodes.find((n) => {
        if (n.id === droppedNode.id) return false;
        if (!n.type || (!portfolioNodeTypes.includes(n.type) && n.type !== 'folder')) return false;
        
        const dx = Math.abs(n.position.x - droppedNode.position.x);
        const dy = Math.abs(n.position.y - droppedNode.position.y);
        
        return dx < overlapThreshold && dy < overlapThreshold;
      });

      if (overlappingNode) {
        // Create a folder
        if (overlappingNode.type === 'folder') {
          // Add to existing folder
          setNodes((nds) => {
            return nds
              .filter((n) => n.id !== droppedNode.id)
              .map((n) => {
                if (n.id === overlappingNode.id) {
                  return {
                    ...n,
                    data: {
                      ...n.data,
                      apps: [
                        ...(n.data.apps || []),
                        {
                          id: droppedNode.id,
                          type: droppedNode.type,
                          data: droppedNode.data,
                        },
                      ],
                    },
                  };
                }
                return n;
              });
          });
        } else {
          // Create new folder with both apps
          const folderId = createNodeId();
          setNodes((nds) => {
            const filtered = nds.filter(
              (n) => n.id !== droppedNode.id && n.id !== overlappingNode.id
            );
            
            return [
              ...filtered,
              {
                id: folderId,
                type: 'folder',
                position: overlappingNode.position,
                data: {
                  name: 'Assets',
                  apps: [
                    {
                      id: overlappingNode.id,
                      type: overlappingNode.type,
                      data: overlappingNode.data,
                    },
                    {
                      id: droppedNode.id,
                      type: droppedNode.type,
                      data: droppedNode.data,
                    },
                  ],
                },
              },
            ];
          });

          toast({
            title: 'Folder created',
            description: 'Apps grouped together',
            status: 'success',
            duration: 2000,
          });
        }
      }
    },
    [nodes, setNodes, toast]
  );

  return (
    <>
      <Flex flexFlow="column" h="100%">
        <Navbar pgName={pgName} setPgName={setPgName}/>
        <Sidebar sidebarContent={sidebarContent} />
        <CommandPalette />
        <Playground
          edges={edges}
          nodes={nodes}

          setEdges={setEdges}
          setNodes={setNodes}

          onNodeChange={onNodesChange}
          onEdgeChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
        />
      </Flex>
    </>
  );
};

export default Home;
