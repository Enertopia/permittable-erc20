// client/src/components/Transfer.jsx
import React, { useState, useContext } from 'react';
import { Box, Button, Input, Text, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { Web3Context } from '../context/Web3Context';

const Transfer = () => {
    const { provider, account } = useContext(Web3Context);
    const [transferTo, setTransferTo] = useState('');
    const [amount, setAmount] = useState('');
    const [tokenAddress, setTokenAddress] = useState('');
    const toast = useToast();

    const handleTransfer = async () => {
        if (!provider || !account) {
            toast({
                title: "Provider error",
                description: "Cannot connect to provider",
                status: "error",
                duration: 9000,
                isClosable: true,
            });
            return;
        }

        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            tokenAddress,
            [
                "function transfer(address to, uint amount) returns (bool)"
            ],
            signer
        );

        try {
            const tx = await contract.transfer(transferTo, ethers.utils.parseEther(amount));
            await tx.wait();
            toast({
                title: "Transfer Successful",
                description: `Tokens successfully transferred to ${transferTo}`,
                status: "success",
                duration: 9000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Transfer Failed",
                description: error.message,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    };

    return (
        <Box borderWidth='1px' borderRadius='lg' overflow='hidden' p={4} m={4}>
            <Text mb="8px">Token Contract Address:</Text>
            <Input
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter token contract address"
                size="md"
            />
            <Text mt={4} mb="8px">To Address:</Text>
            <Input
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="Enter recipient address"
                size="md"
            />
            <Text mt={4} mb="8px">Amount:</Text>
            <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to send"
                type="number"
                size="md"
            />
            <Button onClick={handleTransfer} mt={4} colorScheme="teal">
                Transfer
            </Button>
        </Box>
    );
};

export default Transfer;
