import { Box, Center, Heading } from '@chakra-ui/react'
import Head from 'next/head'

export default function Home() {
  return (
    <Box>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>Friday</title>
      </Head>
      <Center bg="#C3E8BD" w="100vw" h="100vh">
        <Box borderRadius="5%" p={8} bg="white">
          <Heading mb={8} size="lg">
            Submit your submission
          </Heading>
        </Box>
      </Center>
    </Box>
  )
}
