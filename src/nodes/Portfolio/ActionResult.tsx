import React, { FC } from 'react';
import { NodeProps, Position } from 'reactflow';
import { Flex, Text, VStack, Box, Link } from '@chakra-ui/react';
import { CustomHandle } from '@/layouts/CustomHandle';

interface ActionResultData {
  prompt: string;
  result: string;
  status: 'success' | 'error' | 'processing';
  timestamp: string;
  transactionSignature?: string | null;
}

const ActionResult: FC<NodeProps & { data: ActionResultData }> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'success':
        return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      case 'error':
        return 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
      default:
        return 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      default:
        return '⏳';
    }
  };

  const solscanUrl = data.transactionSignature 
    ? `https://solscan.io/tx/${data.transactionSignature}`
    : null;

  return (
    <VStack spacing="8px" cursor="grab" userSelect="none">
      <CustomHandle pos={Position.Left} type="target" />
      {/* Result Icon */}
      <Flex
        w="90px"
        h="90px"
        borderRadius="18px"
        bg={getStatusColor()}
        align="center"
        justify="center"
        position="relative"
        boxShadow={
          selected
            ? '0px 0px 20px rgba(255, 0, 153, 0.8), 0px 8px 25px rgba(0, 0, 0, 0.4)'
            : '0px 5px 20px rgba(0, 0, 0, 0.35)'
        }
        border={selected ? '2px solid #FF0099' : 'none'}
        transition="all 0.2s ease"
        _hover={{
          transform: 'scale(1.05)',
        }}
      >
        <VStack spacing="5px">
          <Text fontSize="3rem" lineHeight="1">
            {getStatusIcon()}
          </Text>
          <Text color="white" fontSize="0.9rem" fontWeight="700">
            {data.status.toUpperCase()}
          </Text>
        </VStack>

        {/* Timestamp badge */}
        <Box
          position="absolute"
          top="5px"
          right="5px"
          bg="rgba(0, 0, 0, 0.3)"
          color="white"
          fontSize="0.8rem"
          fontWeight="600"
          borderRadius="5px"
          px="5px"
          py="2px"
        >
          {new Date(data.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Box>
      </Flex>

      {/* Action Name */}
      <VStack spacing="2px" w="90px">
        <Text
          color="white"
          fontSize="1.2rem"
          fontWeight="600"
          textAlign="center"
          noOfLines={1}
          w="100%"
        >
          Action
        </Text>
        <Text
          color="rgba(255, 255, 255, 0.7)"
          fontSize="1rem"
          fontWeight="500"
          textAlign="center"
          noOfLines={1}
          w="100%"
        >
          {data.prompt.length > 12 ? data.prompt.slice(0, 12) + '...' : data.prompt}
        </Text>
      </VStack>

      {/* Solscan Link */}
      {solscanUrl && (
        <Link
          href={solscanUrl}
          isExternal
          onClick={(e) => e.stopPropagation()}
          bg="rgba(0, 255, 150, 0.2)"
          px="10px"
          py="5px"
          borderRadius="8px"
          _hover={{
            bg: 'rgba(0, 255, 150, 0.3)',
            transform: 'scale(1.05)',
          }}
          transition="all 0.2s"
        >
          <Text color="#00ff96" fontSize="1rem" fontWeight="700">
            View on Solscan →
          </Text>
        </Link>
      )}
    </VStack>
  );
};

export default ActionResult;

