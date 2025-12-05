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
        borderRadius="20px"
        bg={getStatusColor()}
        align="center"
        justify="center"
        position="relative"
        boxShadow={
          selected
            ? '0px 0px 20px rgba(100, 200, 150, 0.6), 0px 10px 30px rgba(0, 0, 0, 0.3)'
            : '0px 8px 32px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1)'
        }
        border={selected ? '2px solid rgba(255, 255, 255, 0.3)' : '0.5px solid rgba(255, 255, 255, 0.18)'}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: 'scale(1.08) translateY(-2px)',
          boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.3), inset 0px 1px 0px rgba(255, 255, 255, 0.15)',
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
          top="4px"
          right="4px"
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="blur(10px)"
          color="white"
          fontSize="0.7rem"
          fontWeight="700"
          borderRadius="8px"
          px="6px"
          py="3px"
          border="0.5px solid rgba(255, 255, 255, 0.2)"
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
          fontSize="1.1rem"
          fontWeight="600"
          textAlign="center"
          noOfLines={1}
          w="100%"
          textShadow="0px 2px 4px rgba(0, 0, 0, 0.3)"
          letterSpacing="0.3px"
        >
          Action
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
          {data.prompt.length > 12 ? data.prompt.slice(0, 12) + '...' : data.prompt}
        </Text>
      </VStack>

      {/* Transaction Signature */}
      {data.transactionSignature && (
        <VStack spacing="4px" w="220px">
          <Text color="rgba(255, 255, 255, 0.5)" fontSize="0.75rem" fontWeight="600" letterSpacing="0.5px">
            TRANSACTION
          </Text>
          <Text
            color="rgba(0, 255, 150, 0.95)"
            fontSize="0.8rem"
            fontWeight="600"
            textAlign="center"
            bg="rgba(0, 0, 0, 0.3)"
            backdropFilter="blur(10px)"
            px="10px"
            py="6px"
            borderRadius="10px"
            w="100%"
            noOfLines={1}
            border="0.5px solid rgba(0, 255, 150, 0.2)"
            boxShadow="0px 2px 8px rgba(0, 255, 150, 0.15)"
          >
            {data.transactionSignature.slice(0, 8)}...{data.transactionSignature.slice(-8)}
          </Text>
        </VStack>
      )}

      {/* Solscan Link */}
      {solscanUrl && (
        <Link
          href={solscanUrl}
          isExternal
          onClick={(e) => e.stopPropagation()}
          bg="linear-gradient(135deg, rgba(0, 255, 150, 0.2) 0%, rgba(0, 200, 120, 0.2) 100%)"
          backdropFilter="blur(10px)"
          px="14px"
          py="8px"
          borderRadius="14px"
          border="0.5px solid rgba(0, 255, 150, 0.3)"
          boxShadow="0px 4px 12px rgba(0, 255, 150, 0.2)"
          _hover={{
            bg: 'linear-gradient(135deg, rgba(0, 255, 150, 0.3) 0%, rgba(0, 200, 120, 0.3) 100%)',
            transform: 'scale(1.05) translateY(-2px)',
            boxShadow: '0px 6px 16px rgba(0, 255, 150, 0.3)',
          }}
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <Text color="#00ff96" fontSize="0.95rem" fontWeight="700" letterSpacing="0.3px">
            View on Solscan →
          </Text>
        </Link>
      )}
    </VStack>
  );
};

export default ActionResult;

