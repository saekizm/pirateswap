// src/hooks/usePresaleContract.js
import { ethers } from 'ethers';
import { useContractFunction, useCall } from '@usedapp/core';
import PresaleContractABI from '../components/contracts/src/abis/PresaleContract.json';

const presaleContractAddress = "0x170B24A387BD31CD495b6A5D530613510bE2536C";
const presaleInterface = new ethers.utils.Interface(PresaleContractABI);

export const usePresaleContract = () => {
  const presaleContract = new ethers.Contract(presaleContractAddress, presaleInterface);
  const { state, send } = useContractFunction(presaleContract, 'buyTokensNFTSale', {
    transactionName: 'Buy NFT Sale',
  });

  // Function to fetch token price
  const tokenPriceInCRO = useCall({
    contract: presaleContract,
    method: 'tokenPriceInCRO',
    args: [],
  })?.value?.[0];

  // Function to fetch NFT sale sold amount
  const nftSaleSold = useCall({
    contract: presaleContract,
    method: 'nftSaleSold',
    args: [],
  })?.value?.[0];

  // Add other necessary read operations in a similar fashion

  return { state, send, tokenPriceInCRO, nftSaleSold };
};
