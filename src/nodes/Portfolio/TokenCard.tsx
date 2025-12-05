/* eslint-disable @next/next/no-img-element */
import React, { FC } from 'react';
import { NodeProps } from 'reactflow';
import { Flex, Text, Box, VStack } from '@chakra-ui/react';
import { MoralisToken } from '@/services/moralis';

const TokenCard: FC<NodeProps & { data: MoralisToken }> = ({ data, selected }) => {
  return (
    <VStack spacing="8px" cursor="grab" userSelect="none">
      {/* App Icon */}
      <Flex
        w="90px"
        h="90px"
        borderRadius="18px"
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
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
            top="5px"
            right="5px"
            w="16px"
            h="16px"
            borderRadius="full"
            bg="#00ff96"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="0.8rem" color="white" lineHeight="1">
              ✓
            </Text>
          </Box>
        )}
      </Flex>

      {/* App Name */}
      <VStack spacing="2px" w="90px">
        <Text
          color="white"
          fontSize="1.2rem"
          fontWeight="600"
          textAlign="center"
          noOfLines={1}
          w="100%"
        >
          {data.symbol}
        </Text>
        <Text
          color="rgba(255, 255, 255, 0.7)"
          fontSize="1rem"
          fontWeight="500"
          textAlign="center"
          noOfLines={1}
          w="100%"
        >
          {parseFloat(data.amount).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </Text>
      </VStack>
    </VStack>
  );
};

export default TokenCard;

