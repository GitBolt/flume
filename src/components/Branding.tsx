/* eslint-disable @next/next/no-img-element */
import { Flex, Text, Box } from "@chakra-ui/react"
import Link from "next/link"

const Branding = () => {
  return (
    <Link href="/">
      <Flex align="center" gap="1rem" cursor="pointer">
        <Box w="4rem" h="4rem">
          <img src="/logo.png" width="100%" height="100%" alt="Flume logo" />
        </Box>
        <Text fontSize="2.2rem" fontWeight={700} color="primary.100">Flume</Text>
      </Flex>
    </Link>
  )
}

export default Branding
