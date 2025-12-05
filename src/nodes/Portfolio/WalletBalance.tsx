import React, { FC } from 'react';
import { NodeProps, useReactFlow, useNodeId, Connection } from 'reactflow';
import { Flex, Text, VStack } from '@chakra-ui/react';
import { CustomHandle } from '@/layouts/CustomHandle';
import { SOL_MINT } from '@/util/assets';

interface BalanceData {
  lamports: string;
  solana: string;
}

const WalletBalance: FC<NodeProps & { data: BalanceData }> = ({ data, selected }) => {
  const solAmount = parseFloat(data.solana);
  const { setNodes } = useReactFlow();
  const id = useNodeId();

  const updateNodeData = (nodeId: string, solData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = {
            ...node.data,
            [id as string]: solData,
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
      token: {
        mint: SOL_MINT, // Native SOL mint
        symbol: 'SOL',
        amount: data.solana,
        decimals: 9,
      },
    });
  };
  
  return (
    <VStack spacing="8px" cursor="grab" userSelect="none" position="relative">
      {/* App Icon */}
      <Flex
        w="90px"
        h="90px"
        borderRadius="20px"
        bg="linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)"
        align="center"
        justify="center"
        boxShadow={
          selected
            ? '0px 0px 20px rgba(79, 172, 254, 0.6), 0px 10px 30px rgba(0, 0, 0, 0.3)'
            : '0px 8px 32px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1)'
        }
        border={selected ? '2px solid #4FACFE' : '0.5px solid rgba(255, 255, 255, 0.18)'}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: 'scale(1.08) translateY(-2px)',
          boxShadow: '0px 12px 40px rgba(79, 172, 254, 0.4)',
        }}
        _active={{
          transform: 'scale(1.02)',
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
      
      <CustomHandle
        pos="right"
        type="source"
        onConnect={handleConnect}
        style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)' }}
      />
    </VStack>
  );
};

export default WalletBalance;
