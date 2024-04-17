// client/src/components/Approve.jsx
import React, { useState, useContext } from 'react';
import { Box, Button, Input, Text, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { Web3Context } from '../context/Web3Context';

const Approve = () => {
    const { provider, account } = useContext(Web3Context);
    const [spender, setSpender] = useState('');
    const [amount, setAmount] = useState('');
    const [tokenAddress, setTokenAddress] = useState('');
    const toast = useToast();

    const handleApproval = async () => {
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
                "function approve(address spender, uint256 amount) public returns (bool)"
            ],
            signer
        );

        try {
            const tx = await contract.approve(spender, ethers.utils.parseEther(amount));
            await tx.wait();
            toast({
                title: "Approval Successful",
                description: `Spender approved to use ${amount} tokens`,
                status: "success",
                duration: 9000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Approval Failed",
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
            <Text mt={4} mb="8px">Spender Address:</Text>
            <Input
                value={spender}
                onChange={(e) => setSpender(e.target.value)}
                placeholder="Enter spender address"
                size="md"
            />
            <Text mt={4} mb="8px">Amount:</Text>
            <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to approve"
                type="number"
                size="md"
            />
            <Button onClick={handleApproval} mt={4} colorScheme="teal">
                Approve
            </Button>
        </Box>
    );
};

export default Approve;
