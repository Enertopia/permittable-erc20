import React from 'react';
import { ChakraProvider, Box, VStack, Heading, extendTheme } from '@chakra-ui/react';
import { Web3Provider } from './Web3Context';
import Balance from './Balance';
import Transfer from './Transfer';
import Approve from './Approve';
import History from './History';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

const App = () => {
    return (
        <ChakraProvider theme={theme}>
            <Web3Provider>
                <Box maxWidth="container.xl" margin="auto" p={5}>
                    <VStack spacing={8}>
                        <Heading>Custom ERC20 DApp</Heading>
                        <Balance />
                        <Transfer />
                        <Approve />
                        <History />
                    </VStack>
                </Box>
            </Web3Provider>
        </ChakraProvider>
    );
};

export default App;
