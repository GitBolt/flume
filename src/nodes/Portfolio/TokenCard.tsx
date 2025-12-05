/* eslint-disable @next/next/no-img-element */
import React, { FC } from 'react';
import { NodeProps, useReactFlow, useNodeId, Connection } from 'reactflow';
import { Flex, Text, Box, VStack } from '@chakra-ui/react';
import { MoralisToken } from '@/services/moralis';
import { CustomHandle } from '@/layouts/CustomHandle';
import { toFlowToken } from '@/util/assets';

const TokenCard: FC<NodeProps & { data: MoralisToken }> = ({ data, selected }) => {
  const { setNodes } = useReactFlow();
  const id = useNodeId();

  const updateNodeData = (nodeId: string, tokenData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = {
            ...node.data,
            [id as string]: tokenData,
          };
        }
        return node;
      })
    );
  };

  const handleConnect = (e: Connection) => {
    if (!e.target) return;
    updateNodeData(e.target, {
      kind: 'token',
      token: toFlowToken(data),
    });
  };

  return (
    <VStack spacing="8px" cursor="grab" userSelect="none" position="relative">
      {/* App Icon */}
      <Flex
        w="90px"
        h="90px"
        borderRadius="20px"
        bg="linear-gradient(135deg, #A1A2FF 0%, #8E8FFF 100%)"
        align="center"
        justify="center"
        position="relative"
        boxShadow={
          selected
            ? '0px 0px 20px rgba(161, 162, 255, 0.6), 0px 10px 30px rgba(0, 0, 0, 0.3)'
            : '0px 8px 32px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1)'
        }
        border={selected ? '2px solid #A1A2FF' : '0.5px solid rgba(255, 255, 255, 0.18)'}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: 'scale(1.08) translateY(-2px)',
          boxShadow: '0px 12px 40px rgba(161, 162, 255, 0.4)',
        }}
        _active={{
          transform: 'scale(1.02)',
        }}
      >
        {data.logo ? (
          <Box
            w="55px"
            h="55px"
            borderRadius="full"
            overflow="hidden"
            bg="white"
            p="5px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <img
              src={data.logo}
              alt={data.symbol}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
        ) : (
          <Text fontSize="3.5rem" color="white">
            💰
          </Text>
        )}
        
        {/* Verified badge - small corner indicator */}
        {data.isVerifiedContract && (
          <Box
            position="absolute"
            top="4px"
            right="4px"
            w="18px"
            h="18px"
            borderRadius="full"
            bg="linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0px 2px 6px rgba(0, 153, 255, 0.4), inset 0px 1px 0px rgba(255, 255, 255, 0.3)"
            border="1.5px solid rgba(255, 255, 255, 0.3)"
          >
            <Text fontSize="0.7rem" color="white" lineHeight="1">
              ✓
            </Text>
          </Box>
        )}
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
          {data.symbol}
        </Text>
        <Text
          color="rgba(255, 255, 255, 0.7)"
          fontSize="0.95rem"
          fontWeight="500"
          textAlign="center"
          noOfLines={1}
          w="100%"
          textShadow="0px 1px 2px rgba(0, 0, 0, 0.3)"
        >
          {parseFloat(data.amount).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </Text>
      </VStack>
      
      <CustomHandle
        pos="right"
        type="source"
        onConnect={handleConnect}
        id="asset"
        style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)' }}
      />
    </VStack>
  );
};

export default TokenCard;
