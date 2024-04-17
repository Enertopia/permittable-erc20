import React, { useEffect, useState } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';
import tokenAbi from './tokenAbi';
import { useWeb3 } from './Web3Context';

const Balance = () => {
    const { provider, account } = useWeb3();
    const [balance, setBalance] = useState('');

    useEffect(() => {
        if (!provider || !account) return;
        const contract = new ethers.Contract(process.env.REACT_APP_TOKEN_ADDRESS, tokenAbi, provider);
        
        const loadBalance = async () => {
            const balance = await contract.balanceOf(account);
            setBalance(ethers.utils.formatEther(balance));
        };

        loadBalance();
    }, [provider, account]);

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white">
            <Text fontSize="xl">Balance: {balance} Tokens</Text>
        </Box>
    );
};

export default Balance;
