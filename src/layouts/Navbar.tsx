import { Button, Divider, Flex, Input, Text } from "@chakra-ui/react"
import { NetworkSelector } from "../components/NetworkSelector"
import React from "react"
import { useReactFlow } from "reactflow"
import dynamic from "next/dynamic"
import Branding from "@/components/Branding"

const Wallets = dynamic(() => import("../components/ConnectWalletButton"), { ssr: false });

type Props = {
  pgName: string,
  setPgName: React.Dispatch<React.SetStateAction<string>>
}

export const Navbar = ({
  pgName,
  setPgName
}: Props) => {

  const { setNodes, setEdges, setViewport } = useReactFlow()

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
    setViewport({ x: 0, y: 0, zoom: 1.5 });
    setPgName("Untitled");
  }

  return (
    <Flex w="100%" p="0 1rem" h="6rem" zIndex="5" bg="bg.200" pos="static" top="0" align="center" justify="space-between" gap="1rem">
      <Flex align="center" gap="2rem">
        <Branding />
        <Button variant="magenta" h="3rem" w="8rem" fontSize="1.4rem" onClick={handleReset}>New Flow</Button>
      </Flex>

      <Input
        w="22rem"
        h="3rem"
        onChange={(e) => {
          setPgName(e.target.value)
        }}
        fontSize="1.5rem"
        color="blue.200"
        value={pgName}
        placeholder="Enter Playground Name"
      />

      <Flex borderRight="1px solid" align="center" borderColor="gray.200" gap="1rem">
        <NetworkSelector />
        <Divider w="2px" h="4rem" bg="gray.200" />
        <Wallets />
      </Flex>

    </Flex>
  )
}
