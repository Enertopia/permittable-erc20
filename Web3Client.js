import { ethers } from "ethers";

export const getWeb3Provider = () => {
    if (typeof window.ethereum !== 'undefined') {
        return new ethers.providers.Web3Provider(window.ethereum);
    } else {
        console.error("Please install MetaMask to use this dApp.");
        return undefined;
    }
}
