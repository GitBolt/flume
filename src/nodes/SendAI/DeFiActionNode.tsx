import React, { FC, useEffect, useMemo, useState } from 'react';
import { NodeProps, useNodeId, useReactFlow } from 'reactflow';
import {
  Flex,
  Text,
  Box,
  useToast,
  Spinner,
  VStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import { CustomHandle } from '@/layouts/CustomHandle';
import { createNodeId } from '@/util/randomData';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { extractAssetsFromNodeData, FlowToken } from '@/util/assets';
import { createAgent } from '@/util/agent';
import { getActionLabel, runSendAIAction, SendAIActionType } from '@/util/sendaiActions';

const DeFiActionNode: FC<NodeProps> = ({ data, type }) => {
  const [loading, setLoading] = useState(false);
  const { setNodes, setEdges, getNode } = useReactFlow();
  const nodeId = useNodeId();
  const toast = useToast();
  const wallet = useWallet();
  const { connection } = useConnection();
  const currentNode = nodeId ? getNode(nodeId) : null;

  const [config, setConfig] = useState<Record<string, any>>(() => data?.config || {});
  const [tokens, setTokens] = useState<FlowToken[]>([]);
  const [configText, setConfigText] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!currentNode) return;
    const assets = extractAssetsFromNodeData(currentNode.data || {});
    const nextTokens = assets.flatMap((asset) => {
      if (asset.kind === 'token') return [asset.token];
      if (asset.kind === 'folder') return asset.tokens;
      return [];
    });
    setTokens(nextTokens);
  }, [currentNode]);

  useEffect(() => {
    setConfigText(JSON.stringify(config && Object.keys(config).length ? config : { tokens }, null, 2));
  }, [config, tokens]);

  useEffect(() => {
    if (!nodeId) return;
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, config } } : n))
    );
  }, [config, nodeId, setNodes]);

  const label = useMemo(() => getActionLabel(type as string), [type]);

  const emoji = useMemo(() => {
    if (String(type).toLowerCase().includes('stake')) return '🔒';
    if (String(type).toLowerCase().includes('swap')) return '🔄';
    if (String(type).toLowerCase().includes('create') || String(type).toLowerCase().includes('open')) return '🧩';
    if (String(type).toLowerCase().includes('close')) return '❌';
    return '⚡';
  }, [type]);

  const appendResultNode = (
    status: 'success' | 'error',
    message: string,
    signature?: string | null
  ) => {
    const currentPos = currentNode?.position || { x: 0, y: 0 };
    const resultNodeId = createNodeId();

    setNodes((nds) => [
      ...nds,
      {
        id: resultNodeId,
        type: 'actionResult',
        position: { x: currentPos.x + 260, y: currentPos.y },
        data: {
          prompt: label,
          result: message,
          status,
          timestamp: new Date().toISOString(),
          transactionSignature: signature || null,
        },
      },
    ]);

    if (nodeId) {
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
    }
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

  const handleExecute = async () => {
    let parsedConfig: Record<string, any> = {};
    try {
      parsedConfig = configText.trim() ? JSON.parse(configText) : {};
      setConfig(parsedConfig);
    } catch (err: any) {
      toast({
        title: 'Invalid config',
        description: err.message || 'Fix JSON before running',
        status: 'error',
      });
      return;
    }

    if (!wallet.connected || !wallet.publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to run this action',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const agent = createAgent(wallet, connection);
      const res = await runSendAIAction(type as SendAIActionType, tokens, parsedConfig, agent);

      const signature = extractSignature(res);
      appendResultNode('success', `${label} executed`, signature);
      toast({
        title: `${label} executed`,
        status: 'success',
        duration: 4000,
      });
    } catch (error: any) {
      console.error('SendAI execution error:', error);
      appendResultNode('error', error.message || 'Failed to execute');
      toast({
        title: 'Execution failed',
        description: error.message || 'Unable to complete SendAI action',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <VStack spacing="8px" cursor="grab" userSelect="none" position="relative">
        <CustomHandle
          pos="left"
          type="target"
          id="token"
          style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)' }}
        />
        
        <Flex
          w="90px"
          h="90px"
          borderRadius="20px"
          bg="linear-gradient(135deg, #A1A2FF 0%, #7172E8 100%)"
          align="center"
          justify="center"
          position="relative"
          boxShadow="0px 8px 32px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1)"
          border="0.5px solid rgba(255, 255, 255, 0.18)"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            transform: 'scale(1.08) translateY(-2px)',
            boxShadow: '0px 12px 40px rgba(161, 162, 255, 0.4)',
          }}
          onClick={onOpen}
          cursor={loading ? 'wait' : 'pointer'}
          opacity={loading ? 0.7 : 1}
        >
          {loading ? (
            <Spinner size="lg" color="white" />
          ) : (
            <Text fontSize="3.5rem">{emoji}</Text>
          )}
          
          {!!tokens.length && (
            <Box
              position="absolute"
              top="4px"
              right="4px"
              w="18px"
              h="18px"
              borderRadius="full"
              bg="green.400"
              boxShadow="0 0 10px green"
            />
          )}
        </Flex>

        <VStack spacing="4px" w="140px">
          <Text
            color="white"
            fontSize="1.1rem"
            fontWeight="600"
            textAlign="center"
            noOfLines={1}
            w="100%"
            textShadow="0px 2px 4px rgba(0, 0, 0, 0.3)"
            letterSpacing="0.3px"
          >
            {label}
          </Text>
          <Text
            color="rgba(255, 255, 255, 0.6)"
            fontSize="0.85rem"
            fontWeight="500"
            textAlign="center"
            noOfLines={2}
            w="100%"
          >
            Click to edit & run
          </Text>
          {!!tokens.length && (
            <Text
              color="rgba(255, 255, 255, 0.6)"
              fontSize="0.8rem"
              fontWeight="500"
              textAlign="center"
              noOfLines={1}
              w="100%"
            >
              {tokens.length} asset{tokens.length > 1 ? 's' : ''} linked
            </Text>
          )}
        </VStack>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="bg.200">
          <ModalHeader color="white">{label}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text color="gray.200" fontSize="0.9rem">
                Provide JSON input for this action. Assets linked to this node are available and will be sent as <code>tokens</code> if not overridden.
              </Text>
              <Textarea
                value={configText}
                onChange={(e) => setConfigText(e.target.value)}
                minH="220px"
                fontFamily="monospace"
              />
              <Divider />
              <Text color="gray.300" fontSize="0.9rem">
                Linked assets: {tokens.length ? tokens.map((t) => t.symbol || t.mint).join(', ') : 'None'}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter display="flex" gap="8px">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  const parsed = configText.trim() ? JSON.parse(configText) : {};
                  setConfig(parsed);
                  toast({ title: 'Config saved', status: 'success', duration: 2000 });
                } catch (err: any) {
                  toast({ title: 'Invalid config', description: err.message, status: 'error' });
                }
              }}
            >
              Save
            </Button>
            <Button colorScheme="pink" onClick={handleExecute} isLoading={loading}>
              Run Action
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeFiActionNode;
