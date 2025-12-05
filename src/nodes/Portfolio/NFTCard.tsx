/* eslint-disable @next/next/no-img-element */
import React, { FC } from 'react';
import { Connection, NodeProps, useNodeId, useReactFlow } from 'reactflow';
import { Flex, Text, VStack } from '@chakra-ui/react';
import { MoralisNFT } from '@/services/moralis';
import { CustomHandle } from '@/layouts/CustomHandle';

const NFTCard: FC<NodeProps & { data: MoralisNFT }> = ({ data, selected }) => {
  const { setNodes } = useReactFlow();
  const id = useNodeId();

  const updateNodeData = (nodeId: string, nftData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = {
            ...node.data,
            [id as string]: nftData,
          };
        }
        return node;
      })
    );
  };

  const handleConnect = (e: Connection) => {
    if (!e.target) return;
    updateNodeData(e.target, {
      kind: 'nft',
      nft: data,
    });
  };

  return (
    <VStack spacing="8px" cursor="grab" userSelect="none" position="relative">
      {/* App Icon */}
      <Flex
        w="90px"
        h="90px"
        borderRadius="20px"
        bg="linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)"
        align="center"
        justify="center"
        boxShadow={
          selected
            ? '0px 0px 20px rgba(255, 107, 157, 0.6), 0px 10px 30px rgba(0, 0, 0, 0.3)'
            : '0px 8px 32px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1)'
        }
        border={selected ? '2px solid #FF6B9D' : '0.5px solid rgba(255, 255, 255, 0.18)'}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: 'scale(1.08) translateY(-2px)',
          boxShadow: '0px 12px 40px rgba(255, 107, 157, 0.4)',
        }}
        _active={{
          transform: 'scale(1.02)',
        }}
      >
        <Text fontSize="4.5rem" lineHeight="1">
          🎨
        </Text>
      </Flex>

      {/* App Name */}
      <VStack spacing="2px" w="90px">
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
          {data.name.length > 10 ? data.name.slice(0, 10) + '...' : data.name}
        </Text>
        <Text
          color="rgba(255, 255, 255, 0.7)"
          fontSize="0.95rem"
          fontWeight="500"
          textAlign="center"
          textShadow="0px 1px 2px rgba(0, 0, 0, 0.3)"
        >
          NFT
        </Text>
      </VStack>
      
      <CustomHandle
        pos="right"
        type="source"
        id="asset"
        onConnect={handleConnect}
        style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)' }}
      />
    </VStack>
  );
};

export default NFTCard;
