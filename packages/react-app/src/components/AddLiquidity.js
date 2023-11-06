import React, { useState, useEffect, useMemo } from 'react';
import { useEthers, useTokenBalance, useContractFunction, useEtherBalance } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { formatUnits, parseUnits, formatEther } from '@ethersproject/units';
import { Button, Grid, Typography, Container, useTheme, useMediaQuery } from '@mui/material';
import { MAINNET_ID, addresses, abis } from "./contracts";
import TokenInput from "./TokenInput"
import { constants, BigNumber } from 'ethers';
import TokenDialog from './TokenDialog';
import useBalance from './useBalance';
import { TOKENS } from '../tokens';

const AddLiquidity = ({ initialPair }) => {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [tokenField, setTokenField] = useState('');
  const [approvalA, setApprovalA] = useState(false);
  const [approvalB, setApprovalB] = useState(false);
  const { library: provider, account } = useEthers();
  const theme = useTheme();
  const [pair, setPair] = useState(initialPair || null);
  const [pairContract, setPairContract] = useState(null);
  const [decimalsA, setDecimalsA] = useState(null);
  const [decimalsB, setDecimalsB] = useState(null);
  const [symbolA, setSymbolA] = useState(null)
  const [symbolB, setSymbolB] = useState(null)
  const tokenABalance = useBalance(tokenA, symbolA, account);
  const tokenBBalance = useBalance(tokenB, symbolB, account);
  const factory = new Contract(addresses[MAINNET_ID].factory, abis.factory, provider);
  const uniswapV2RouterContract = new Contract(addresses[MAINNET_ID].router02, abis.router02);
  const { send: addLiquidity, state: addLiquidityState } = useContractFunction(uniswapV2RouterContract, 'addLiquidity', {
    transactionName: 'Add Liquidity',
  });
  const { send: addLiquidityETH, state: addLiquidityETHState } = useContractFunction(uniswapV2RouterContract, 'addLiquidityETH', {
    transactionName: 'Add LiquiditETH',
  });
  const tokenContractA = useMemo(() => {
    return new Contract(tokenA, abis.erc20.abi, provider.getSigner());
  }, [tokenA, provider]);

  const tokenContractB = useMemo(() => {
    return new Contract(tokenB, abis.erc20.abi, provider.getSigner());
  }, [tokenB, provider]);

  const handlePercentage = async (field, percentage) => {
    let balance, decimals;
    if (field === 'A') {
      balance = tokenABalance;
      decimals = decimalsA;

    } else if (field === 'B') {
      balance = tokenBBalance;
      decimals = decimalsB;
    } else {
      // Handle invalid field error
      console.error("Invalid field passed to handlePercentage");
      return;
    }

    // Check if the balance is available and a decimal count is set
    if (balance && decimals) {
      // Calculate the new amount based on the percentage of the balance
      // Convert the percentage to BigNumber
      const percentageBN = BigNumber.from(percentage.toString());
      // Multiply balance by percentage
      const amount = balance.mul(percentageBN);
      // Divide by 100 (as a BigNumber)
      const hundredBN = BigNumber.from('100');
      const finalAmount = amount.div(hundredBN);
      const formattedAmount = formatUnits(finalAmount, decimals);
      const amounts = await getAmount(formattedAmount, field);
      // Update the state with the new amount
      setAmountA(amounts.amountA);
      setAmountB(amounts.amountB);
    }
  };

  const checkAllowance = async (tokenContract, amount, decimals, setApproval) => {
    if (account && tokenContract && amount && decimals) {
      const amountBN = parseUnits(amount, decimals); // Convert the desired amount to BigNumber using its decimals
      const allowance = await tokenContract.allowance(account, addresses[MAINNET_ID].router02);
      setApproval(!allowance.gte(amountBN)); // Set approval to true if allowance is greater than or equal to the amount
    }
  };
  // For token A
  useEffect(() => {
    if (tokenContractA && account) {
      checkAllowance(tokenContractA, amountA, decimalsA, setApprovalA);
    }
  }, [tokenContractA, account, amountA, decimalsA]);
  // For token B
  useEffect(() => {
    if (tokenContractB && account) {
      checkAllowance(tokenContractB, amountB, decimalsB, setApprovalB);
    }
  }, [tokenContractB, account, amountB, decimalsB]);

  const getAmount = async (inputValue, field) => {
    if (!pairContract) {
      console.error('Pair contract or tokens not set:', pairContract, tokenA, tokenB);
      return { amountA: '', amountB: '' };
    }

    const [reserveA, reserveB] = await pairContract.getReserves();
    const token0 = await pairContract.token0();
    const tokenAIsFirst = tokenA.toLowerCase() === token0.toLowerCase();
    const reserveTokenA = tokenAIsFirst ? reserveA : reserveB;
    const reserveTokenB = tokenAIsFirst ? reserveB : reserveA;

    if (field === 'A') {
      const amountADesiredBN = parseUnits(inputValue, decimalsA);
      const amountBN = amountADesiredBN.mul(reserveTokenB).div(reserveTokenA);
      const amountB = formatUnits(amountBN, decimalsB);
      return { amountA: inputValue, amountB };
    } else { // If field is 'B'
      const amountBDesiredBN = parseUnits(inputValue, decimalsB);
      const amountAN = amountBDesiredBN.mul(reserveTokenA).div(reserveTokenB);
      const amountA = formatUnits(amountAN, decimalsA);
      return { amountA, amountB: inputValue };
    }
  };

  useEffect(() => {
    if (pair) {
      const pair2set = new Contract(pair.id, abis.pair, provider);
      setPairContract(pair2set);
      if (pair.token0.symbol == 'WCRO') {
        const cro = TOKENS.find(token => token.symbol === 'CRO');
        setTokenA(pair.token0.id);
        setSymbolA(cro.symbol);
        setDecimalsA(18);
        setTokenB(pair.token1.id);
        setSymbolB(pair.token1.symbol);
        setDecimalsB(pair.token1.decimals);
      }
      else if (pair.token1.symbol == 'WCRO') {
        const cro = TOKENS.find(token => token.symbol === 'CRO');
        setTokenB(pair.token1.id);
        setSymbolB(cro.symbol);
        setDecimalsB(18);
        setTokenA(pair.token0.id);
        setSymbolA(pair.token0.symbol);
        setDecimalsA(pair.token0.decimals);
      }
      else {
        setTokenA(pair.token0.id);
        setTokenB(pair.token1.id);
        setSymbolA(pair.token0.symbol);
        setSymbolB(pair.token1.symbol);
        setDecimalsA(pair.token0.decimals);
        setDecimalsB(pair.token1.decimals);
      }
    }
    else {
      setTokenA('');
      setTokenB('');
      setSymbolA('');
      setSymbolB('');
      setDecimalsA('');
      setDecimalsB('');
    }
  }, [pair]);

  useEffect(() => {
    if (tokenA && tokenB) {

      const fetchPairAddress = async () => {
        try {
          const pairAddress = await factory.getPair(tokenA, tokenB);

          if (pairAddress && pairAddress !== constants.AddressZero) {
            const pairContractInstance = new Contract(pairAddress, abis.pair, provider);
            setPairContract(pairContractInstance);
          }
        } catch (error) {
          console.log(tokenA, tokenB)
          console.error('Error fetching pair address:', error);
          // You could set some state here to show an error message to the user
        }
      };

      fetchPairAddress().catch((error) => {
        console.error('Error in fetchPairAddress:', error);
      });
    }
  }, [tokenA, tokenB, factory, setPairContract, constants.AddressZero, abis.pair]);

  const handleAddLiquidity = async () => {
    if (pairContract) {
      const parsedAmountA = parseUnits(amountA, decimalsA);
      const parsedAmountB = parseUnits(amountB, decimalsB);

      if (symbolA === 'CRO') {
        // If token A is ETH, call addLiquidityETH
        await addLiquidityETH(
          tokenB, // Token address for token B (ERC-20)
          parsedAmountB, // Amount of token B
          0, // Min amount of token B (with slippage)
          0, // Min amount of ETH (with slippage)
          account, // User's account address
          Math.floor(Date.now() / 1000) + 60 * 20, // Deadline
          { value: parsedAmountA } // Amount of ETH to send with the transaction
        );
      } else if (symbolB === 'CRO') {
        // If token B is ETH, call addLiquidityETH
        await addLiquidityETH(
          tokenA, // Token address for token A (ERC-20)
          parsedAmountA, // Amount of token A
          0, // Min amount of token A (with slippage)
          0, // Min amount of ETH (with slippage)
          account, // User's account address
          Math.floor(Date.now() / 1000) + 60 * 20, // Deadline
          { value: parsedAmountB } // Amount of ETH to send with the transaction
        );
      } else {
        // If neither token is ETH, call the standard addLiquidity
        await addLiquidity(
          tokenA, // Token address for token A
          tokenB, // Token address for token B
          parsedAmountA, // Amount of token A
          parsedAmountB, // Amount of token B
          0, // Min amount of token A (with slippage)
          0, // Min amount of token B (with slippage)
          account, // User's account address
          Math.floor(Date.now() / 1000) + 60 * 20 // Deadline
        );
      }
    } else {


    }
  };

  const handleOpenDialog = (field) => {
    setTokenField(field);
    setOpenDialog(true);
  };

  const handleCloseDialog = (token) => {
    setOpenDialog(false);
    if (token) {
      if (tokenField === 'A') {
        setTokenA(token.address);
        setSymbolA(token.symbol)
        setDecimalsA(token.decimals);
      } else {
        setTokenB(token.address);
        setSymbolB(token.symbol);
        setDecimalsB(token.decimals);
      }
    }
  };

  const handleTokenSelect = (token) => {
    // handle the token selection
    handleCloseDialog(token); // this function now acts as the onSelect handler
  };

  const handleApprove = async (tokenContract, setApproval) => {
    try {
      const transactionResponse = await tokenContract.approve(addresses[MAINNET_ID].router02, constants.MaxUint256);
      // You could add a loading state here
      await transactionResponse.wait();  // wait for the transaction to be mined
      setApproval(false); // Reflecting the approval in the UI
    } catch (error) {
      console.error("Could not approve token", error);
      // Handle error, possibly setting some state to inform the user
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        mt: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6">Add Liquidity</Typography>
      <Grid container spacing={3}>
        {/* Input for token A */}
        <Grid item xs={12}>
          <TokenInput
            amount={amountA}
            setAmountA={setAmountA}
            setAmountB={setAmountB}
            label="Amount"
            field="A"
            handlePercentage={handlePercentage}
            handleOpenDialog={handleOpenDialog}
            tokenContract={tokenContractA}
            getAmount={getAmount}
            symbol={symbolA}
          />
        </Grid>
        {/* Input for token B */}
        <Grid item xs={12}>
          <TokenInput
            amount={amountB}
            setAmountA={setAmountA}
            setAmountB={setAmountB}
            label="Amount"
            field="B"
            handlePercentage={handlePercentage}
            handleOpenDialog={handleOpenDialog}
            tokenContract={tokenContractB}
            getAmount={getAmount}
            symbol={symbolB}
          />
        </Grid>
        {/* Add liquidity button */}
        <Grid item xs={12}>
          {(approvalA || approvalB) ? (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => {
                if (approvalA) handleApprove(tokenContractA, setApprovalA);
                if (approvalB) handleApprove(tokenContractB, setApprovalB);
              }}
              disabled={!account || addLiquidityState.status === 'Mining'}
            >
              Approve {approvalA ? symbolA : ''} {approvalB ? symbolB : ''}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAddLiquidity}
              disabled={!account || addLiquidityState.status === 'Mining'}
            >
              Add Liquidity
            </Button>
          )}
        </Grid>

      </Grid>
      {/* Token selection dialog */}
      <TokenDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSelect={handleTokenSelect}
      // Add any necessary props for the TokenDialog
      />
    </Container>
  );
}

export default AddLiquidity;

