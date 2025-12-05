import React, { useState } from 'react';
import { Button, Flex, Text, useToast } from '@chakra-ui/react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useReactFlow } from 'reactflow';
import { createNodeId } from '@/util/randomData';
import { extractAssetsFromNodeData, FlowToken } from '@/util/assets';
import { createAgent } from '@/util/agent';
import { getActionLabel, runSendAIAction, SendAIActionType } from '@/util/sendaiActions';

export const FlowExecutor = () => {
  const { getNodes, setNodes, setEdges } = useReactFlow();
  const wallet = useWallet();
  const { connection } = useConnection();
  const toast = useToast();
  const [running, setRunning] = useState(false);

  const appendResult = (
    nodeId: string,
    label: string,
    status: 'success' | 'error',
    message: string,
    signature?: string | null
  ) => {
    const sourceNode = getNodes().find((n) => n.id === nodeId);
    const pos = sourceNode?.position || { x: 0, y: 0 };
    const resultNodeId = createNodeId();

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

  const gatherTokens = (nodeData: Record<string, any>): FlowToken[] => {
    const assets = extractAssetsFromNodeData(nodeData || {});
    return assets.flatMap((asset) => {
      if (asset.kind === 'token') return [asset.token];
      if (asset.kind === 'folder') return asset.tokens;
      return [];
    });
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

    const actionNodes = getNodes()
      .filter((n) => typeof n.type === 'string' && getActionLabel(n.type))
      .sort((a, b) => a.position.x - b.position.x);

    if (!actionNodes.length) {
      toast({
        title: 'No SendAI actions on canvas',
        status: 'info',
      });
      return;
    }

    setRunning(true);
    try {
      const agent = createAgent(wallet, connection);

      for (const node of actionNodes) {
        const nodeType = node.type as SendAIActionType;
        const tokens = gatherTokens(node.data || {});
        const config = node.data?.config || {};
        const label = getActionLabel(nodeType) || 'Action';

        try {
          const res = await runSendAIAction(nodeType, tokens, config, agent);
          const signature = extractSignature(res);
          if (res?.status && res.status !== 'success') {
            throw new Error(res.message || `${label} returned an error`);
          }
          appendResult(node.id, label, 'success', `${label} executed`, signature);
        } catch (err: any) {
          appendResult(node.id, label, 'error', err.message || 'Failed to execute');
        }
      }

      toast({
        title: 'Flow executed',
        description: 'Finished running SendAI actions',
        status: 'success',
      });
    } catch (error: any) {
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
    <Flex position="fixed" right="2rem" top="8rem" direction="column" gap="0.5rem" zIndex={5} align="flex-end">
      <Button
        variant="magenta"
        size="lg"
        onClick={executeFlow}
        isLoading={running}
        loadingText="Executing"
      >
        Execute Flow →
      </Button>
      <Text color="gray.200" fontSize="0.9rem">
        Runs connected DeFi actions from left to right.
      </Text>
    </Flex>
  );
};
