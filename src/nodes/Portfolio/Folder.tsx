/* eslint-disable @next/next/no-img-element */
import React, { FC, useState } from 'react';
import { NodeProps, useReactFlow, useNodeId, Position } from 'reactflow';
import { Flex, Text, VStack, Box, Grid, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Input, Button, HStack, useToast, Spinner } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createNodeId } from '@/util/randomData';
import { CustomHandle } from '@/layouts/CustomHandle';

interface FolderData {
  name: string;
  apps: Array<{
    id: string;
    type: string;
    data: any;
    icon?: string;
    label?: string;
  }>;
}

const Folder: FC<NodeProps & { data: FolderData }> = ({ data, selected }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const folderName = data.name || 'Folder';
  const apps = data.apps || [];
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { setNodes, setEdges, getNode } = useReactFlow();
  const nodeId = useNodeId();
  const toast = useToast();
  const { publicKey } = useWallet();

  // Get preview icons (first 4 apps in folder)
  const previewApps = apps.slice(0, 4);

  const getAppIcon = (app: any) => {
    // Return appropriate emoji or icon based on app type
    if (app.type === 'tokenCard') {
      return app.data?.logo ? (
        <img src={app.data.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : '💰';
    } else if (app.type === 'nftCard') {
      return '🎨';
    } else if (app.type === 'walletBalance') {
      return '◎';
    }
    return '📱';
  };

  const getAppLabel = (app: any) => {
    if (app.type === 'tokenCard') {
      return app.data?.symbol || 'Token';
    } else if (app.type === 'nftCard') {
      return app.data?.name?.slice(0, 8) || 'NFT';
    } else if (app.type === 'walletBalance') {
      return 'Wallet';
    }
    return 'App';
  };

  const handleAIAction = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Please enter a prompt',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    if (!publicKey) {
      toast({
        title: 'Please connect your wallet',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // For now, we'll create a simulated result
      // In production, you'd call the API route here
      const response = await fetch('/api/agent-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          walletAddress: publicKey.toBase58(),
          folderApps: apps,
        }),
      });

      const result = await response.json();

      // Get current folder position
      const currentNode = getNode(nodeId || '');
      const folderPosition = currentNode?.position || { x: 0, y: 0 };

      // Create result node branching from folder
      const resultNodeId = createNodeId();
      const resultNode = {
        id: resultNodeId,
        type: 'actionResult',
        position: {
          x: folderPosition.x + 250,
          y: folderPosition.y,
        },
        data: {
          prompt,
          result: result.text || result.error || 'Processing complete',
          status: result.success ? 'success' : 'error',
          timestamp: new Date().toISOString(),
          transactionSignature: result.transactionSignature || null,
        },
      };

      setNodes((nds) => [...nds, resultNode]);

      // Create edge from folder to result node
      if (nodeId) {
        setEdges((eds) => [
          ...eds,
          {
            id: `${nodeId}-${resultNodeId}`,
            source: nodeId,
            target: resultNodeId,
            type: 'default',
            animated: result.success,
            style: {
              stroke: result.success ? '#00ff96' : '#ff4444',
              strokeWidth: 2,
            },
          },
        ]);
      }

      toast({
        title: result.success ? 'Action completed' : 'Action failed',
        description: result.text?.slice(0, 100) || result.error?.slice(0, 100),
        status: result.success ? 'success' : 'error',
        duration: 5000,
      });

      setPrompt('');
      onClose();
    } catch (error: any) {
      console.error('AI Action error:', error);
      
      // Still create a result node showing the error
      const currentNode = getNode(nodeId || '');
      const folderPosition = currentNode?.position || { x: 0, y: 0 };

      const errorNodeId = createNodeId();
      const errorNode = {
        id: errorNodeId,
        type: 'actionResult',
        position: {
          x: folderPosition.x + 250,
          y: folderPosition.y,
        },
        data: {
          prompt,
          result: error.message || 'Failed to process action',
          status: 'error' as const,
          timestamp: new Date().toISOString(),
          transactionSignature: null,
        },
      };

      setNodes((nds) => [...nds, errorNode]);

      // Create edge from folder to error node
      if (nodeId) {
        setEdges((eds) => [
          ...eds,
          {
            id: `${nodeId}-${errorNodeId}`,
            source: nodeId,
            target: errorNodeId,
            type: 'default',
            animated: false,
            style: {
              stroke: '#ff4444',
              strokeWidth: 2,
            },
          },
        ]);
      }

      toast({
        title: 'Action failed',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <VStack spacing="12px" cursor="grab" userSelect="none">
        <CustomHandle pos={Position.Right} type="source" />
        {/* Folder Icon */}
        <Flex
          w="90px"
          h="90px"
          borderRadius="18px"
          bg="linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)"
          backdropFilter="blur(20px)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          align="center"
          justify="center"
          position="relative"
          boxShadow={
            selected
              ? '0px 0px 20px rgba(255, 0, 153, 0.8), 0px 8px 25px rgba(0, 0, 0, 0.4)'
              : '0px 5px 20px rgba(0, 0, 0, 0.35)'
          }
          onClick={onOpen}
          transition="all 0.2s ease"
          _hover={{
            transform: 'scale(1.05)',
            bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
          }}
        >
          {/* Grid of mini app icons */}
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap="8px"
            w="70%"
            h="70%"
          >
            {previewApps.map((app: any, index: number) => (
              <Box
                key={index}
                w="100%"
                h="100%"
                borderRadius="6px"
                bg={
                  app.type === 'tokenCard'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : app.type === 'nftCard'
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                }
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="1.2rem"
              >
                {typeof getAppIcon(app) === 'string' ? (
                  <Text>{getAppIcon(app)}</Text>
                ) : (
                  <Box w="80%" h="80%" borderRadius="full" bg="white" p="2px">
                    {getAppIcon(app)}
                  </Box>
                )}
              </Box>
            ))}
            {/* Fill empty slots with placeholder */}
            {[...Array(Math.max(0, 4 - previewApps.length))].map((_, index) => (
              <Box
                key={`empty-${index}`}
                w="100%"
                h="100%"
                borderRadius="6px"
                bg="rgba(255, 255, 255, 0.1)"
              />
            ))}
          </Grid>

          {/* App count badge */}
          {apps.length > 4 && (
            <Box
              position="absolute"
              top="5px"
              right="5px"
              bg="rgba(255, 0, 153, 0.9)"
              color="white"
              fontSize="0.9rem"
              fontWeight="700"
              borderRadius="full"
              w="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {apps.length}
            </Box>
          )}
        </Flex>

        {/* Folder Name */}
        <Text
          color="white"
          fontSize="1.2rem"
          fontWeight="600"
          textAlign="center"
          noOfLines={1}
          w="90px"
        >
          {folderName}
        </Text>

        {/* AI Input Field - Below Folder on Canvas */}
        <Box
          w="200px"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <HStack spacing="5px">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isProcessing) {
                  handleAIAction();
                }
              }}
              placeholder="AI command..."
              bg="rgba(40, 40, 60, 0.95)"
              border="1px solid rgba(255, 255, 255, 0.2)"
              color="white"
              fontSize="1.1rem"
              h="32px"
              _placeholder={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1rem' }}
              _hover={{ 
                bg: 'rgba(50, 50, 70, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
              _focus={{
                bg: 'rgba(50, 50, 70, 0.95)',
                border: '1px solid rgba(255, 0, 153, 0.6)',
                outline: 'none',
                boxShadow: '0px 0px 10px rgba(255, 0, 153, 0.3)'
              }}
              disabled={isProcessing}
            />
            <Button
              onClick={handleAIAction}
              isDisabled={isProcessing || !prompt.trim()}
              bg="linear-gradient(135deg, #FF0099 0%, #FF00FF 100%)"
              color="white"
              fontSize="1rem"
              fontWeight="700"
              px="12px"
              h="32px"
              minW="50px"
              _hover={{
                transform: 'scale(1.05)',
              }}
              _active={{
                transform: 'scale(0.95)',
              }}
            >
              {isProcessing ? <Spinner size="sm" /> : '→'}
            </Button>
          </HStack>
        </Box>
      </VStack>

      {/* Folder Open Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)" />
        <ModalContent
          bg="linear-gradient(135deg, rgba(40, 40, 60, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)"
          backdropFilter="blur(20px)"
          borderRadius="20px"
          border="1px solid rgba(255, 255, 255, 0.1)"
          maxH="80vh"
        >
          <ModalHeader color="white" fontSize="2rem" fontWeight="700">
            {folderName}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <Grid
              templateColumns="repeat(4, 1fr)"
              gap="20px"
              p="10px"
            >
              {apps.map((app: any, index: number) => (
                <VStack key={index} spacing="8px" position="relative">
                  {/* Remove button */}
                  <Box
                    position="absolute"
                    top="-5px"
                    right="-5px"
                    w="20px"
                    h="20px"
                    borderRadius="full"
                    bg="rgba(255, 0, 0, 0.9)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    zIndex={10}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Remove app from folder
                      setNodes((nds) =>
                        nds.map((n) => {
                          if (n.id === nodeId) {
                            return {
                              ...n,
                              data: {
                                ...n.data,
                                apps: apps.filter((_: any, i: number) => i !== index),
                              },
                            };
                          }
                          return n;
                        })
                      );
                      toast({
                        title: 'App removed from folder',
                        status: 'info',
                        duration: 2000,
                      });
                    }}
                    _hover={{
                      bg: 'rgba(255, 0, 0, 1)',
                      transform: 'scale(1.1)',
                    }}
                    transition="all 0.2s"
                  >
                    <Text color="white" fontSize="1.2rem" fontWeight="700" lineHeight="1">
                      ×
                    </Text>
                  </Box>
                  
                  <Flex
                    w="70px"
                    h="70px"
                    borderRadius="15px"
                    bg={
                      app.type === 'tokenCard'
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : app.type === 'nftCard'
                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                    }
                    align="center"
                    justify="center"
                    boxShadow="0px 5px 15px rgba(0, 0, 0, 0.3)"
                    cursor="pointer"
                    transition="all 0.2s ease"
                    _hover={{
                      transform: 'scale(1.1)',
                    }}
                  >
                    {typeof getAppIcon(app) === 'string' ? (
                      <Text fontSize="3rem">{getAppIcon(app)}</Text>
                    ) : (
                      <Box w="40px" h="40px" borderRadius="full" bg="white" p="3px">
                        {getAppIcon(app)}
                      </Box>
                    )}
                  </Flex>
                  <Text
                    color="white"
                    fontSize="1.1rem"
                    fontWeight="600"
                    textAlign="center"
                    noOfLines={1}
                    w="70px"
                  >
                    {getAppLabel(app)}
                  </Text>
                </VStack>
              ))}
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Folder;

