import React, { FC } from 'react';
import { NodeProps } from 'reactflow';
import { Flex, Text, VStack } from '@chakra-ui/react';

interface BalanceData {
  lamports: string;
  solana: string;
}

const WalletBalance: FC<NodeProps & { data: BalanceData }> = ({ data, selected }) => {
  const solAmount = parseFloat(data.solana);
  
  return (
    <VStack spacing="8px" cursor="grab" userSelect="none">
      {/* App Icon */}
      <Flex
        w="90px"
        h="90px"
        borderRadius="18px"
        bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        align="center"
        justify="center"
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
        <Text fontSize="5rem" lineHeight="1">
          ◎
        </Text>
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
          Wallet
        </Text>
        <Text
          color="rgba(255, 255, 255, 0.7)"
          fontSize="1rem"
          fontWeight="500"
          textAlign="center"
          noOfLines={1}
          w="100%"
        >
          {solAmount.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })} SOL
        </Text>
      </VStack>
    </VStack>
  );
};

export default WalletBalance;

