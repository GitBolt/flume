import React from 'react';
import { Flex, VStack, Text, Box, Divider, Button } from '@chakra-ui/react';
import { useReactFlow } from 'reactflow';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { createNodeId } from '@/util/randomData';
import { extractAssetsFromNodeData, FlowToken } from '@/util/assets';
import { createAgent } from '@/util/agent';
import { getActionLabel, runSendAIAction, SendAIActionType } from '@/util/sendaiActions';
import { useToast } from '@chakra-ui/react';

export const InfoSidebar = () => {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const wallet = useWallet();
  const { connection } = useConnection();
  const toast = useToast();
  const [running, setRunning] = useState(false);

  const nodes = getNodes();
  const edges = getEdges();

  const actionNodes = nodes.filter((n) => typeof n.type === 'string' && getActionLabel(n.type));
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  const connectedFlowNodes = actionNodes.filter(n => connectedNodeIds.has(n.id));

  const assetNodes = nodes.filter((n) => 
    n.type === 'tokenCard' || n.type === 'nftCard' || n.type === 'walletBalance' || n.type === 'folder'
  );

  const extractSignature = (res: any): string | null => {
    if (!res) return null;
    if (typeof res === 'string') return res;
    if (typeof res.signature === 'string') return res.signature;
    if (typeof res.transaction === 'string') return res.transaction;
    if (Array.isArray(res.transactions) && typeof res.transactions[0] === 'string') {
      return res.transactions[0];
    }
    return null;
  };

  const extractReturnData = (res: any): any => {
    if (!res) return null;
    
    // If res has data field, use that
    if (res.data !== undefined && res.data !== null) {
      return res.data;
    }
    
    // If res itself is an object with meaningful data (not just status/message)
    if (typeof res === 'object' && res !== null) {
      // Exclude common metadata fields
      const excludeFields = ['status', 'message', 'signature', 'transaction', 'transactions', 'error', 'errors'];
      const dataFields = Object.keys(res).filter(key => !excludeFields.includes(key));
      
      if (dataFields.length > 0) {
        // Return the object with only data fields
        const dataObj: any = {};
        dataFields.forEach(key => {
          dataObj[key] = res[key];
        });
        return Object.keys(dataObj).length > 0 ? dataObj : null;
      }
    }
    
    return null;
  };

  const formatReturnData = (data: any): string => {
    if (data === null || data === undefined) return '';
    
    // If it's already a string, try to parse it as JSON
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return data;
      }
    }
    
    // If it's an object, stringify it nicely
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    
    return String(data);
  };

  const gatherTokens = (nodeData: Record<string, any>): FlowToken[] => {
    const assets = extractAssetsFromNodeData(nodeData || {});
    return assets.flatMap((asset) => {
      if (asset.kind === 'token') return [asset.token];
      if (asset.kind === 'folder') return asset.tokens;
      return [];
    });
  };

  const appendResult = (
    nodeId: string,
    label: string,
    status: 'success' | 'error',
    message: string,
    signature?: string | null,
    returnData?: any
  ) => {
    const sourceNode = getNodes().find((n) => n.id === nodeId);
    const pos = sourceNode?.position || { x: 0, y: 0 };
    const resultNodeId = createNodeId();

    // Format return data if present
    const formattedData = returnData ? formatReturnData(returnData) : null;

    setNodes((nds) => [
      ...nds,
      {
        id: resultNodeId,
        type: 'actionResult',
        position: { x: pos.x + 260, y: pos.y },
        data: {
          prompt: label,
          result: message,
          status,
          timestamp: new Date().toISOString(),
          transactionSignature: signature || null,
          returnData: formattedData,
        },
      },
    ]);

    setEdges((eds) => [
      ...eds,
      {
        id: `${nodeId}-${resultNodeId}`,
        source: nodeId,
        target: resultNodeId,
        animated: status === 'success',
        style: { stroke: status === 'success' ? '#92FE9D' : '#FF6B6B', strokeWidth: 2 },
      },
    ]);
  };

  const executeFlow = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({
        title: 'Connect wallet',
        description: 'You need to connect a wallet to run SendAI flows',
        status: 'error',
      });
      return;
    }

    if (!connectedFlowNodes.length) {
      toast({
        title: 'No connected flows found',
        description: 'Connect nodes with edges to create a flow',
        status: 'info',
        duration: 5000,
      });
      return;
    }

    setRunning(true);
    try {
      const agent = createAgent(wallet, connection);
      const sortedNodes = [...connectedFlowNodes].sort((a, b) => a.position.x - b.position.x);

      console.log('Executing flow with nodes:', sortedNodes.map(n => ({ id: n.id, type: n.type, config: n.data?.config })));

      for (const node of sortedNodes) {
        const nodeType = node.type as SendAIActionType;
        const tokens = gatherTokens(node.data || {});
        const config = node.data?.config || {};
        const label = getActionLabel(nodeType) || 'Action';

        console.log(`Executing node ${node.id}:`, { nodeType, label, config, tokensCount: tokens.length });

        try {
          const res = await runSendAIAction(nodeType, tokens, config, agent);
          console.log(`Node ${node.id} result:`, res);
          const signature = extractSignature(res);
          const returnData = extractReturnData(res);
          if (res?.status && res.status !== 'success') {
            throw new Error(res.message || `${label} returned an error`);
          }
          appendResult(node.id, label, 'success', `${label} executed`, signature, returnData);
        } catch (err: any) {
          console.error(`Node ${node.id} error:`, err);
          appendResult(node.id, label, 'error', err.message || 'Failed to execute');
          toast({
            title: `${label} failed`,
            description: err.message || 'Failed to execute',
            status: 'error',
            duration: 5000,
          });
        }
      }

      toast({
        title: 'Flow executed',
        description: 'Finished running SendAI actions',
        status: 'success',
      });
    } catch (error: any) {
      console.error('Flow execution error:', error);
      toast({
        title: 'Flow failed',
        description: error.message || 'Unable to run SendAI actions',
        status: 'error',
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Flex
      position="fixed"
      right="0"
      top="6rem"
      h="calc(100vh - 6rem)"
      w="20rem"
      bg="rgba(30, 30, 46, 0.95)"
      borderLeft="1px solid rgba(161, 162, 255, 0.2)"
      boxShadow="-5px 0 20px rgba(0, 0, 0, 0.3)"
      zIndex={1}
      p="2rem"
      flexDirection="column"
      gap="2rem"
      overflow="hidden"
    >
      <VStack spacing="2rem" align="stretch" flex="1">
        <Box>
          <Text fontSize="2rem" fontWeight="700" color="#FFFFFF" mb="1.5rem">
            Canvas Info
          </Text>
          
          <VStack spacing="1.5rem" align="stretch">
            <Box
              bg="rgba(161, 162, 255, 0.1)"
              p="1.5rem"
              borderRadius="1rem"
              border="1px solid rgba(161, 162, 255, 0.2)"
            >
              <Text fontSize="0.9rem" color="rgba(255, 255, 255, 0.6)" mb="0.5rem">
                Total Nodes
              </Text>
              <Text fontSize="2.5rem" fontWeight="700" color="#FFFFFF">
                {nodes.length}
              </Text>
            </Box>

            <Box
              bg="rgba(161, 162, 255, 0.1)"
              p="1.5rem"
              borderRadius="1rem"
              border="1px solid rgba(161, 162, 255, 0.2)"
            >
              <Text fontSize="0.9rem" color="rgba(255, 255, 255, 0.6)" mb="0.5rem">
                Action Nodes
              </Text>
              <Text fontSize="2.5rem" fontWeight="700" color="#B5B6FF">
                {actionNodes.length}
              </Text>
            </Box>

            <Box
              bg="rgba(146, 254, 157, 0.1)"
              p="1.5rem"
              borderRadius="1rem"
              border="1px solid rgba(146, 254, 157, 0.2)"
            >
              <Text fontSize="0.9rem" color="rgba(255, 255, 255, 0.6)" mb="0.5rem">
                Connected Flows
              </Text>
              <Text fontSize="2.5rem" fontWeight="700" color="#92FE9D">
                {connectedFlowNodes.length}
              </Text>
            </Box>

            <Box
              bg="rgba(255, 255, 255, 0.05)"
              p="1.5rem"
              borderRadius="1rem"
              border="1px solid rgba(255, 255, 255, 0.1)"
            >
              <Text fontSize="0.9rem" color="rgba(255, 255, 255, 0.6)" mb="0.5rem">
                Asset Nodes
              </Text>
              <Text fontSize="2.5rem" fontWeight="700" color="#FFFFFF">
                {assetNodes.length}
              </Text>
            </Box>

            <Box
              bg="rgba(255, 255, 255, 0.05)"
              p="1.5rem"
              borderRadius="1rem"
              border="1px solid rgba(255, 255, 255, 0.1)"
            >
              <Text fontSize="0.9rem" color="rgba(255, 255, 255, 0.6)" mb="0.5rem">
                Connections
              </Text>
              <Text fontSize="2.5rem" fontWeight="700" color="#FFFFFF">
                {edges.length}
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>

      <Divider borderColor="rgba(161, 162, 255, 0.2)" />

      <Button
        bg="linear-gradient(135deg, #A1A2FF 0%, #7172E8 100%)"
        color="#FFFFFF"
        size="lg"
        fontSize="1.4rem"
        fontWeight="700"
        h="4.5rem"
        w="100%"
        onClick={executeFlow}
        isLoading={running}
        loadingText="Running"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(161, 162, 255, 0.5)',
        }}
        _active={{
          transform: 'translateY(0px)',
        }}
        transition="all 0.2s"
        isDisabled={connectedFlowNodes.length === 0}
      >
        Execute Flow →
      </Button>

      <Text color="rgba(255, 255, 255, 0.6)" fontSize="0.85rem" textAlign="center" fontWeight="500">
        {connectedFlowNodes.length === 0 
          ? 'Connect nodes with edges to create a flow'
          : `${connectedFlowNodes.length} node${connectedFlowNodes.length > 1 ? 's' : ''} will execute`
        }
      </Text>
    </Flex>
  );
};

