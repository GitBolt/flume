/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { useReactFlow } from 'reactflow';
import { Flex, Button, List, ListItem, Text, Box, SimpleGrid, VStack, Image, keyframes } from '@chakra-ui/react'
import Branding from '@/components/Branding';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { SidebarContentType } from '@/types/sidebar';
import { createNodeId, createNodePos } from '@/util/randomData';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

type Props = {
  sidebarContent: SidebarContentType[],
}

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
`;

const Sidebar = ({ sidebarContent }: Props) => {
  const { setNodes } = useReactFlow();
  const [showSublist, setShowSublist] = useState<{ [key: number]: boolean }>({});
  const [selectedItemTitle, setSelectedItemTitle] = useState<string>(sidebarContent[0]?.title || 'Adrena') // Default to first category
  const [installing, setInstalling] = useState<string | null>(null);

  const addNode = (type: string) => {
    setNodes((nodes) => nodes.concat({
      id: createNodeId(),
      position: createNodePos(),
      type,
      data: {}
    }))
  }

  const toggleSublist = (index: number) => {
    setShowSublist({
      ...showSublist,
      [index]: !showSublist[index],
    });
  };

  const handleNodeAdd = (type: string, title: string) => {
    setInstalling(title);
    setTimeout(() => {
        addNode(type);
        setInstalling(null);
    }, 500); // Quick install animation delay
  }

  return (

    <Flex sx={{
      pos: "fixed",
      h: "100vh",
      w: "36rem",
      overflowY: "auto",
      overflowX: "hidden",
      zIndex: 2,
    }}>

      <Flex sx={{
        w: "25%",
        bg: "bg.200",
        h: "100%",
        flexFlow: "column",
        boxShadow: "3px 0px 15px rgba(0, 0, 0, 0.36)",
        zIndex: 3,
        borderRadius: "0 5rem 5rem 0",
        gap: "2rem",
        justifyContent: 'center',

      }}>
        {sidebarContent.map((item) => (
          <Flex
            cursor="pointer"
            _hover={{ bg: "bg.400" }}
            w="7rem"
            h="7rem"
            alignSelf="center"
            borderRadius="1rem"
            onClick={() => setSelectedItemTitle(item.title)}
            key={item.title}
            flexFlow="column"
            align="center"
            gap="1rem"
            justify="center"
            bg={item.title == selectedItemTitle ? 'bg.400' : 'transparent'}
            boxShadow={item.title == selectedItemTitle ?
              'inset -4px -4px 5px rgba(52, 53, 87, 0.25), inset 4px 4px 5px rgba(0, 0, 0, 0.25)' :
              '-4px -4px 5px rgba(52, 53, 87, 0.25), 4px 4px 5px rgba(0, 0, 0, 0.25)'
            }
          >
            <Box h="1.8rem" w="1.8rem">
              <img src={item.icon} style={{ filter: `hue-rotate(350deg)` }} alt="Icon" height="100%" width="100%" />
            </Box>
            <Text color="blue.100" fontWeight={500} fontSize="1.5rem">{item.title}</Text>
          </Flex>
        ))}
      </Flex>

      <Flex sx={{
        w: "75%",
        background: "bg.100",
        borderRight: "1px solid",
        borderColor: "gray.100",
        flexFlow: "column",
        height: "100%",
      }}>
        <Box mt="8rem" />
        <Branding />
        <Flex w="100%" borderRadius="2rem 2rem 0 0" h="4rem" align="center" justify="center" bg="bg.300">
          <Text color="blue.100" fontWeight={600} fontSize="1.8rem">
            Actions
          </Text>
        </Flex>

        <Box p="4" flex="1" overflowY="auto">
            <SimpleGrid columns={2} spacing={4}>
            {selectedItemTitle && sidebarContent.find((item) => item.title == selectedItemTitle)!.items.map((item, index) => (
                <Box
                    key={item.title}
                    bg="bg.200"
                    p="4"
                    borderRadius="xl"
                    cursor="pointer"
                    onClick={() => handleNodeAdd(item.type, item.title)}
                    transition="all 0.2s"
                    transform={installing === item.title ? "scale(0.95)" : "scale(1)"}
                    opacity={installing === item.title ? 0.7 : 1}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg', bg: 'bg.300' }}
                    position="relative"
                    overflow="hidden"
                >
                    {installing === item.title && (
                        <Box position="absolute" top="0" left="0" w="100%" h="100%" bg="rgba(0,255,150,0.1)" zIndex={1} display="flex" alignItems="center" justifyContent="center">
                            <Text color="green.300" fontWeight="bold">Installing...</Text>
                        </Box>
                    )}
                    <VStack spacing={3}>
                        <Box w="12" h="12" bg="bg.400" borderRadius="xl" p="2" display="flex" alignItems="center" justifyContent="center">
                             {item.icon ? <img src={item.icon} alt={item.title} /> : <Box w="100%" h="100%" bg="blue.400" borderRadius="full" />}
                        </Box>
                        <Text color="white" fontWeight="bold" fontSize="lg" textAlign="center">{item.title}</Text>
                        <Button 
                            size="sm" 
                            colorScheme="blue" 
                            w="full" 
                            variant="outline"
                            isLoading={installing === item.title}
                            loadingText="Adding"
                        >
                            Install
                        </Button>
                    </VStack>
                </Box>
            ))}
            </SimpleGrid>
        </Box>

        <Box mt="auto">
          <ThemeSwitcher />
        </Box>
      </Flex>
    </Flex>

  )

}
export default Sidebar;
