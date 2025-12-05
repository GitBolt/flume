import React, { FC } from 'react';
import { NodeProps, Position } from 'reactflow';
import { Box, Text, VStack, Link, Icon, Flex } from '@chakra-ui/react';
import { ExternalLinkIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { CustomHandle } from '@/layouts/CustomHandle';

const SignatureNode: FC<NodeProps> = ({ data }) => {
  return (
    <VStack spacing="8px" cursor="grab" userSelect="none" position="relative">
      <CustomHandle
        pos="left"
        type="target"
        style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)' }}
      />
      
      <Flex
        w="90px"
        h="90px"
        borderRadius="20px"
        bg="linear-gradient(135deg, #00ff96 0%, #00d4aa 100%)"
        align="center"
        justify="center"
        position="relative"
        boxShadow="0px 0px 20px rgba(0, 255, 150, 0.4), 0px 8px 32px rgba(0, 0, 0, 0.25)"
        border="0.5px solid rgba(255, 255, 255, 0.18)"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: 'scale(1.08) translateY(-2px)',
          boxShadow: '0px 0px 30px rgba(0, 255, 150, 0.6)',
        }}
      >
        <Icon as={CheckCircleIcon} w="40px" h="40px" color="white" />
      </Flex>

      <VStack spacing="2px" w="90px">
        <Text
          color="#00ff96"
          fontSize="1.1rem"
          fontWeight="600"
          textAlign="center"
          noOfLines={1}
          w="100%"
          textShadow="0px 2px 4px rgba(0, 0, 0, 0.3)"
          letterSpacing="0.3px"
        >
          Success
        </Text>
        <Link 
          href={`https://explorer.solana.com/tx/${data.signature}`}
          isExternal 
          color="blue.300" 
          fontSize="0.75rem"
          display="flex"
          alignItems="center"
          gap="2px"
          textDecoration="none"
          _hover={{ textDecoration: 'underline' }}
        >
          View <Icon as={ExternalLinkIcon} boxSize="10px" />
        </Link>
      </VStack>
    </VStack>
  );
};

export default SignatureNode;
