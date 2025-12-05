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
  Input,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  HStack,
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
  
  // Input field values
  const [inputAmount, setInputAmount] = useState<string>(config.inputAmount?.toString() || '');
  const [outputMint, setOutputMint] = useState<string>(config.outputMint || '');
  const [inputMint, setInputMint] = useState<string>(config.inputMint || '');
  const [slippageBps, setSlippageBps] = useState<string>(config.slippageBps?.toString() || '50');
  const [amount, setAmount] = useState<string>(config.amount?.toString() || '');
  const [leverage, setLeverage] = useState<string>(config.leverage?.toString() || '');
  const [ticker, setTicker] = useState<string>(config.ticker || '');

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
    // Sync input fields with config
    if (config.inputAmount) setInputAmount(config.inputAmount.toString());
    if (config.outputMint) setOutputMint(config.outputMint);
    if (config.inputMint) setInputMint(config.inputMint);
    if (config.slippageBps) setSlippageBps(config.slippageBps.toString());
    if (config.amount) setAmount(config.amount.toString());
    if (config.leverage) setLeverage(config.leverage.toString());
    if (config.ticker) setTicker(config.ticker);
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

  const buildConfigFromInputs = (): Record<string, any> => {
    const actionType = type as string;
    const newConfig: Record<string, any> = {};

    // Trade action
    if (actionType === 'trade') {
      if (inputAmount) newConfig.inputAmount = parseFloat(inputAmount);
      if (outputMint) newConfig.outputMint = outputMint;
      if (inputMint) newConfig.inputMint = inputMint;
      if (slippageBps) newConfig.slippageBps = parseInt(slippageBps);
    }
    // Stake actions
    else if (actionType === 'stakeWithJup' || actionType === 'stakeWithSolayer') {
      if (amount) newConfig.amount = parseFloat(amount);
    }
    // Perp trade actions
    else if (actionType.includes('PerpTrade') || actionType === 'openPerpTradeLong' || actionType === 'openPerpTradeShort') {
      if (amount) newConfig.amount = parseFloat(amount);
      if (leverage) newConfig.leverage = parseInt(leverage);
    }
    // Token lookup
    else if (actionType === 'getTokenAddressFromTicker' || actionType === 'getTokenByTicker') {
      if (ticker) newConfig.ticker = ticker;
    }
    // Default: use JSON if provided
    else if (configText.trim()) {
      try {
        return JSON.parse(configText);
      } catch {
        return {};
      }
    }

    return newConfig;
  };

  const handleExecute = async () => {
    let parsedConfig: Record<string, any> = buildConfigFromInputs();
    
    // If JSON textarea has content, try to parse it (for advanced users)
    if (configText.trim() && Object.keys(parsedConfig).length === 0) {
      try {
        parsedConfig = JSON.parse(configText);
      } catch (err: any) {
        toast({
          title: 'Invalid config',
          description: err.message || 'Fix JSON before running',
          status: 'error',
        });
        return;
      }
    }
    
    setConfig(parsedConfig);

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
        <ModalContent bg="rgba(30, 30, 46, 0.98)" border="1px solid rgba(161, 162, 255, 0.2)">
          <ModalHeader color="#FFFFFF" fontSize="2rem" fontWeight="700">{label}</ModalHeader>
          <ModalCloseButton color="#FFFFFF" />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              {tokens.length > 0 && (
                <Box bg="rgba(161, 162, 255, 0.1)" p="1rem" borderRadius="0.8rem" border="1px solid rgba(161, 162, 255, 0.3)">
                  <Text color="#B5B6FF" fontSize="0.9rem" fontWeight="600" mb="0.5rem">Linked Assets:</Text>
                  <Text color="#FFFFFF" fontSize="0.95rem">
                    {tokens.map((t) => t.symbol || t.mint).join(', ')}
                  </Text>
                </Box>
              )}

              {/* Trade Action Fields */}
              {(type === 'trade') && (
                <VStack align="stretch" spacing={3}>
                  <FormControl>
                    <FormLabel color="#FFFFFF" fontSize="1rem">Input Amount</FormLabel>
                    <NumberInput value={inputAmount} onChange={(_, val) => setInputAmount(val.toString())}>
                      <NumberInputField bg="rgba(255, 255, 255, 0.1)" border="1px solid rgba(161, 162, 255, 0.3)" color="#FFFFFF" _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }} />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#FFFFFF" fontSize="1rem">Output Token Mint</FormLabel>
                    <Input value={outputMint} onChange={(e) => setOutputMint(e.target.value)} placeholder="e.g., EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" bg="rgba(255, 255, 255, 0.1)" border="1px solid rgba(161, 162, 255, 0.3)" color="#FFFFFF" _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#FFFFFF" fontSize="1rem">Input Token Mint (optional)</FormLabel>
                    <Input value={inputMint} onChange={(e) => setInputMint(e.target.value)} placeholder="Leave empty to use linked assets" bg="rgba(255, 255, 255, 0.1)" border="1px solid rgba(161, 162, 255, 0.3)" color="#FFFFFF" _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#FFFFFF" fontSize="1rem">Slippage (basis points)</FormLabel>
                    <NumberInput value={slippageBps} onChange={(_, val) => setSlippageBps(val.toString())}>
                      <NumberInputField bg="rgba(255, 255, 255, 0.1)" border="1px solid rgba(161, 162, 255, 0.3)" color="#FFFFFF" />
                    </NumberInput>
                  </FormControl>
                </VStack>
              )}

              {/* Stake Actions */}
              {(type === 'stakeWithJup' || type === 'stakeWithSolayer') && (
                <FormControl>
                  <FormLabel color="#FFFFFF" fontSize="1rem">Amount</FormLabel>
                  <NumberInput value={amount} onChange={(_, val) => setAmount(val.toString())}>
                    <NumberInputField bg="rgba(255, 255, 255, 0.1)" border="1px solid rgba(161, 162, 255, 0.3)" color="#FFFFFF" _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }} />
                  </NumberInput>
                </FormControl>
              )}

              {/* Perp Trade Actions */}
              {(type.includes('PerpTrade') || type === 'openPerpTradeLong' || type === 'openPerpTradeShort') && (
                <VStack align="stretch" spacing={3}>
                  <FormControl>
                    <FormLabel color="#FFFFFF" fontSize="1rem">Amount</FormLabel>
                    <NumberInput value={amount} onChange={(_, val) => setAmount(val.toString())}>
                      <NumberInputField bg="rgba(255, 255, 255, 0.1)" border="1px solid rgba(161, 162, 255, 0.3)" color="#FFFFFF" />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel color="#FFFFFF" fontSize="1rem">Leverage</FormLabel>
                    <NumberInput value={leverage} onChange={(_, val) => setLeverage(val.toString())}>
                      <NumberInputField bg="rgba(255, 255, 255, 0.1)" border="1px solid rgba(161, 162, 255, 0.3)" color="#FFFFFF" />
                    </NumberInput>
                  </FormControl>
                </VStack>
              )}

              {/* Token Lookup */}
              {(type === 'getTokenAddressFromTicker' || type === 'getTokenByTicker') && (
                <FormControl>
                  <FormLabel color="#FFFFFF" fontSize="1rem">Ticker Symbol</FormLabel>
                  <Input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="e.g., JUP, USDC" bg="rgba(255, 255, 255, 0.1)" border="1px solid rgba(161, 162, 255, 0.3)" color="#FFFFFF" _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }} />
                </FormControl>
              )}

              <Divider borderColor="rgba(161, 162, 255, 0.2)" />

              {/* Advanced JSON Editor */}
              <Box>
                <Text color="#B5B6FF" fontSize="0.9rem" fontWeight="600" mb="0.5rem">Advanced: JSON Config</Text>
                <Textarea
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  minH="150px"
                  fontFamily="monospace"
                  fontSize="0.9rem"
                  bg="rgba(0, 0, 0, 0.3)"
                  border="1px solid rgba(161, 162, 255, 0.3)"
                  color="#FFFFFF"
                  _placeholder={{ color: "rgba(255, 255, 255, 0.5)" }}
                  placeholder='{"custom": "config"}'
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter display="flex" gap="8px">
            <Button variant="ghost" mr={3} onClick={onClose} color="#FFFFFF">
              Close
            </Button>
            <Button
              bg="linear-gradient(135deg, #A1A2FF 0%, #7172E8 100%)"
              color="#FFFFFF"
              onClick={handleExecute}
              isLoading={loading}
              fontWeight="700"
              _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(161, 162, 255, 0.4)' }}
            >
              Run Action
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeFiActionNode;
