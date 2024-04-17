// client/src/components/Balance.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Box, Button, Text, Input, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { Web3Context } from '../context/Web3Context';

const Balance = () => {
    const { provider, account } = useContext(Web3Context);
    const [balance, setBalance] = useState('0');
    const [tokenAddress, setTokenAddress] = useState('');
    const toast = useToast();

    useEffect(() => {
        if (!provider || !account || !ethers.utils.isAddress(tokenAddress)) return;

        const contract = new ethers.Contract(
            tokenAddress,
            [
                "function balanceOf(address owner) view returns (uint256)"
            ],
            provider
        );

        const getBalance = async () => {
            try {
                const balance = await contract.balanceOf(account);
                setBalance(ethers.utils.formatEther(balance));
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch balance',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                });
            }
        };

        getBalance();
    }, [provider, account, tokenAddress]);

    return (
        <Box borderWidth='1px' borderRadius='lg' overflow='hidden' p={4} m={4}>
            <div>
                <Text mb="8px">Token Address:</Text>
                <Input
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="Enter token contract address"
                    size="md"
                />
                <Button onClick={() => {}} mt={4} colorScheme="teal">
                    Check Balance
                </Button>
                <Text mt={4}>Balance: {balance} Tokens</Text>
            </div>
        </Box>
    );
};

export default Balance;
