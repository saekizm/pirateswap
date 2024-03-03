// src/hooks/usePresaleContract.js
import { ethers } from 'ethers';
import { useContractFunction, useCall, useEthers } from '@usedapp/core';
import PresaleContractABI from '../components/contracts/src/abis/PresaleContract.json';

const presaleContractAddress = "0x1DF5ed77598aEeC7Ae928a33e4a07dBfbD8e0478";
const presaleInterface = new ethers.utils.Interface(PresaleContractABI);
export const usePresaleContract = () => {
  const {account} = useEthers();
  const presaleContract = new ethers.Contract(presaleContractAddress, presaleInterface);
  const { state, send } = useContractFunction(presaleContract, 'withdrawTokens', {
    transactionName: 'Withdraw Tokens',
  });

  // Function to fetch token price
  const tokenPriceInCRO = useCall({
    contract: presaleContract,
    method: 'tokenPriceInCRO',
    args: [],
  })?.value?.[0];

  // Function to fetch NFT sale sold amount
  const publicSaleSold = useCall({
    contract: presaleContract,
    method: 'publicSaleSold',
    args: [],
  })?.value?.[0];

  const allocations = useCall({
    contract: presaleContract,
    method: 'allocations',
    args: [account],
  })?.value?.[0];

  // Add other necessary read operations in a similar fashion

  return { state, send, tokenPriceInCRO, allocations, publicSaleSold };
};
