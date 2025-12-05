/* eslint-disable @next/next/no-img-element */
import React, { FC } from 'react';
import { NodeProps, useReactFlow, useNodeId, Position, Connection } from 'reactflow';
import { Flex, Text, VStack, Box, Grid, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, useToast } from '@chakra-ui/react';
import { createNodeId } from '@/util/randomData';
import { CustomHandle } from '@/layouts/CustomHandle';
import { FlowToken, SOL_MINT } from '@/util/assets';

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
  const { setNodes } = useReactFlow();
  const nodeId = useNodeId();
  const toast = useToast();

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

  const handleConnect = (e: Connection) => {
    if (!e.target) return;

    const tokens: FlowToken[] = [];
    const nfts: any[] = [];

    apps.forEach((app: any) => {
      if (app.type === 'tokenCard' && app.data) {
        tokens.push({
          amount: app.data.amount,
          decimals: app.data.decimals,
          mint: app.data.mint,
          symbol: app.data.symbol,
          logo: app.data.logo,
          name: app.data.name,
        });
      }
      if (app.type === 'walletBalance' && app.data) {
        tokens.push({
          amount: app.data.solana,
          decimals: 9,
          mint: SOL_MINT,
          symbol: 'SOL',
          name: 'Solana',
        });
      }
      if (app.type === 'nftCard' && app.data) {
        nfts.push(app.data);
      }
    });

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === e.target) {
          return {
            ...node,
            data: {
              ...node.data,
              [nodeId as string]: {
                kind: 'folder',
                tokens,
                nfts,
                name: folderName,
              },
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <>
      <VStack spacing="12px" cursor="grab" userSelect="none">
        <CustomHandle pos={Position.Right} type="source" id="asset" onConnect={handleConnect} />
        {/* Folder Icon */}
        <Flex
          w="90px"
          h="90px"
          borderRadius="20px"
          bg="linear-gradient(135deg, rgba(120, 120, 140, 0.25) 0%, rgba(100, 100, 120, 0.15) 100%)"
          backdropFilter="blur(40px) saturate(180%)"
          border="0.5px solid rgba(255, 255, 255, 0.18)"
          align="center"
          justify="center"
          position="relative"
          boxShadow={
            selected
              ? '0px 0px 20px rgba(100, 150, 255, 0.6), 0px 10px 30px rgba(0, 0, 0, 0.3)'
              : '0px 8px 32px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1)'
          }
          onClick={onOpen}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            transform: 'scale(1.08) translateY(-2px)',
            bg: 'linear-gradient(135deg, rgba(130, 130, 150, 0.3) 0%, rgba(110, 110, 130, 0.2) 100%)',
            boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.3), inset 0px 1px 0px rgba(255, 255, 255, 0.15)',
          }}
          _active={{
            transform: 'scale(1.02)',
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
                borderRadius="8px"
                bg={
                  app.type === 'tokenCard'
                    ? 'linear-gradient(135deg, #A1A2FF 0%, #8E8FFF 100%)'
                    : app.type === 'nftCard'
                    ? 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)'
                    : 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)'
                }
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="1.3rem"
                boxShadow="inset 0px 1px 0px rgba(255, 255, 255, 0.2)"
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
              top="4px"
              right="4px"
              bg="linear-gradient(135deg, #FF006E 0%, #FF4E91 100%)"
              color="white"
              fontSize="0.75rem"
              fontWeight="800"
              borderRadius="full"
              w="22px"
              h="22px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0px 2px 8px rgba(255, 0, 110, 0.4), inset 0px 1px 0px rgba(255, 255, 255, 0.3)"
              border="1.5px solid rgba(255, 255, 255, 0.3)"
            >
              {apps.length}
            </Box>
          )}
        </Flex>

        {/* Folder Name */}
        <Text
          color="white"
          fontSize="1.1rem"
          fontWeight="600"
          textAlign="center"
          noOfLines={1}
          w="90px"
          textShadow="0px 2px 4px rgba(0, 0, 0, 0.3)"
          letterSpacing="0.3px"
        >
          {folderName}
        </Text>
      </VStack>

      {/* Folder Open Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.75)" backdropFilter="blur(20px)" />
        <ModalContent
          bg="linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)"
          backdropFilter="blur(40px) saturate(180%)"
          borderRadius="24px"
          border="0.5px solid rgba(255, 255, 255, 0.1)"
          maxH="80vh"
          boxShadow="0px 20px 60px rgba(0, 0, 0, 0.5)"
        >
          <ModalHeader 
            color="white" 
            fontSize="1.8rem" 
            fontWeight="700"
            pt="24px"
            textShadow="0px 2px 4px rgba(0, 0, 0, 0.3)"
            letterSpacing="0.3px"
          >
            {folderName}
          </ModalHeader>
          <ModalCloseButton 
            color="white" 
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            borderRadius="full"
          />
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
                    top="-6px"
                    right="-6px"
                    w="24px"
                    h="24px"
                    borderRadius="full"
                    bg="linear-gradient(135deg, #ff3b3b 0%, #ff6b6b 100%)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    zIndex={10}
                    boxShadow="0px 2px 8px rgba(255, 59, 59, 0.4), inset 0px 1px 0px rgba(255, 255, 255, 0.3)"
                    border="1.5px solid rgba(255, 255, 255, 0.3)"
                    onClick={(e) => {
                      e.stopPropagation();
                      const removedApp = apps[index];
                      const updatedApps = apps.filter((_: any, i: number) => i !== index);
                      
                      // Remove app from folder
                      setNodes((nds) => {
                        const updatedNodes = nds.map((n) => {
                          if (n.id === nodeId) {
                            return {
                              ...n,
                              data: {
                                ...n.data,
                                apps: updatedApps,
                              },
                            };
                          }
                          return n;
                        });

                        // If folder is now empty, remove it; otherwise add the app back to canvas
                        if (updatedApps.length === 0) {
                          // Remove the folder
                          return updatedNodes.filter(n => n.id !== nodeId);
                        } else {
                          // Get current folder node to position the removed app nearby
                          const currentFolder = nds.find(n => n.id === nodeId);
                          const folderPos = currentFolder?.position || { x: 0, y: 0 };
                          
                          // Add the removed app back to the canvas
                          return [
                            ...updatedNodes,
                            {
                              id: removedApp.id,
                              type: removedApp.type,
                              position: {
                                x: folderPos.x + 150, // Position to the right of folder
                                y: folderPos.y,
                              },
                              data: removedApp.data,
                            },
                          ];
                        }
                      });

                      if (updatedApps.length === 0) {
                        toast({
                          title: 'Folder removed',
                          description: 'Last app removed from folder',
                          status: 'info',
                          duration: 2000,
                        });
                        onClose(); // Close modal if folder is empty
                      } else {
                        toast({
                          title: 'App removed from folder',
                          status: 'info',
                          duration: 2000,
                        });
                      }
                    }}
                    _hover={{
                      bg: 'linear-gradient(135deg, #ff2020 0%, #ff5050 100%)',
                      transform: 'scale(1.15)',
                      boxShadow: '0px 3px 12px rgba(255, 59, 59, 0.6)',
                    }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    <Text color="white" fontSize="1.3rem" fontWeight="900" lineHeight="1">
                      ×
                    </Text>
                  </Box>
                  
                  <Flex
                    w="70px"
                    h="70px"
                    borderRadius="16px"
                    bg={
                      app.type === 'tokenCard'
                        ? 'linear-gradient(135deg, #A1A2FF 0%, #8E8FFF 100%)'
                        : app.type === 'nftCard'
                        ? 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)'
                        : 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)'
                    }
                    align="center"
                    justify="center"
                    boxShadow="0px 6px 20px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.2)"
                    cursor="pointer"
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      transform: 'scale(1.08) translateY(-2px)',
                      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.3), inset 0px 1px 0px rgba(255, 255, 255, 0.2)',
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
                    fontSize="1rem"
                    fontWeight="600"
                    textAlign="center"
                    noOfLines={1}
                    w="70px"
                    textShadow="0px 1px 2px rgba(0, 0, 0, 0.3)"
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
