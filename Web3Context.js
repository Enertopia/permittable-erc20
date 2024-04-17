import React, { createContext, useContext, useEffect, useState } from 'react';
import { getWeb3Provider } from './Web3Client';
import { useToast } from '@chakra-ui/react';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const init = async () => {
            const web3Provider = getWeb3Provider();
            if (web3Provider) {
                setProvider(web3Provider);
                const accounts = await web3Provider.send("eth_requestAccounts", []);
                setAccount(accounts[0]);
            }
        };

        init();
    }, []);

    useEffect(() => {
        if (!account) {
            toast({
                title: "Wallet not connected",
                description: "Please connect to MetaMask.",
                status: "warning",
                duration: 9000,
                isClosable: true,
            });
        }
    }, [account, toast]);

    return (
        <Web3Context.Provider value={{ provider, account }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => useContext(Web3Context);
