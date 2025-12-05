import { Flex } from "@chakra-ui/react"
import React from "react"
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

  return (
    <Flex w="100%" px="2rem" h="6rem" zIndex="5" bg="bg.300" pos="static" top="0" align="center" justify="space-between" gap="1rem">
      <Branding />
      <Wallets />
    </Flex>
  )
}
