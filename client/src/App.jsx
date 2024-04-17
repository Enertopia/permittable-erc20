// client/src/App.jsx
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Web3Provider } from './context/Web3Context';
import theme from './theme';
import Balance from './components/Balance';
import Transfer from './components/Transfer';
import Approve from './components/Approve';
import History from './components/History';

const App = () => {
    return (
        <ChakraProvider theme={theme}>
            <Web3Provider>
                <div style={{ padding: 20 }}>
                    <h1>ERC-20 Token Dashboard</h1>
                    <Balance />
                    <Transfer />
                    <Approve />
                    <History />
                </div>
            </Web3Provider>
        </ChakraProvider>
    );
};

export default App;
