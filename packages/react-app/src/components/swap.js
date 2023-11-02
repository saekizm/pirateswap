import React, { useState, useEffect, useMemo } from 'react';
import { useEthers, useTokenBalance, useContractFunction, useEtherBalance } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Button, Grid, Typography, Container } from '@mui/material';
import { MAINNET_ID, addresses, abis } from "./contracts";
import TokenInput from "./TokenInput"
import { constants } from 'ethers';
import TokenDialog from './TokenDialog';
import useBalance from './useBalance';

const Swap = () => {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [tokenField, setTokenField] = useState('');
  const [approvalA, setApprovalA] = useState(false);
  const [approvalB, setApprovalB] = useState(false);
  const { library: provider, account } = useEthers();
  const isETH = (tokenAddress) => tokenAddress === '';

  const tokenContractA = useMemo(() => {
    return !isETH(tokenA) ? new Contract(tokenA, abis.erc20.abi, provider.getSigner()) : null;
  }, [tokenA, provider]);

  const tokenContractB = useMemo(() => {
    return !isETH(tokenB) ? new Contract(tokenB, abis.erc20.abi, provider.getSigner()) : null;
  }, [tokenB, provider]);
  const tokenABalance = useBalance(tokenA, account);
  const tokenBBalance = useBalance(tokenB, account);

  const [decimalsA, setDecimalsA] = useState(null);
  const [decimalsB, setDecimalsB] = useState(null);
  const [symbolA, setSymbolA] = useState(null)
  const [symbolB, setSymbolB] = useState(null)
  const etherBalance = useEtherBalance(account);

  const DEFAULT_DECIMALS = 18;

  const effectiveTokenA = isETH(tokenA) ? addresses[MAINNET_ID].tokens.WCRO : tokenA;
  const effectiveTokenB = isETH(tokenB) ? addresses[MAINNET_ID].tokens.WCRO : tokenB;

  // Handler for maximum balance
  const handlePercentage = async (field, percentage) => {
    const balance = field === 'A' ? tokenABalance : tokenBBalance;
    // Check if the token is ETH to decide which decimals to use
    const decimals = field === 'A' ? (isETH(tokenA) ? DEFAULT_DECIMALS : decimalsA) : (isETH(tokenB) ? DEFAULT_DECIMALS : decimalsB);

    if (balance && decimals != null) {
      const formattedBalance = formatUnits(balance.mul(percentage).div(100), decimals);
      if (field === 'A') {
        setAmountA(formattedBalance);
        console.log(formattedBalance)
      } else {
        setAmountB(formattedBalance);
      }
      console.log(formatUnits(balance, decimals), formattedBalance);
    }
  };


  // Dialog handlers
  const handleOpenDialog = (field) => {
    setTokenField(field);
    setOpenDialog(true);
  };

  const handleCloseDialog = (token) => {
    setOpenDialog(false);
    if (token) {
      if (tokenField === 'A') {
        setTokenA(token.address);
      } else {
        setTokenB(token.address);
      }
    }
  };

  const uniswapV2RouterContract = new Contract(addresses[MAINNET_ID].router02, abis.router02);

  const { send: swapExactETHForTokens } = useContractFunction(uniswapV2RouterContract, 'swapExactETHForTokens', {
    transactionName: 'Swap ETH for Tokens',
  });
  
  const { send: swapExactTokensForETH } = useContractFunction(uniswapV2RouterContract, 'swapExactTokensForETH', {
    transactionName: 'Swap Tokens for ETH',
  });
  
  const { send: swapExactTokensForTokens, state: swapTokensState } = useContractFunction(uniswapV2RouterContract, 'swapExactTokensForTokens', {
    transactionName: 'Swap Tokens for Tokens',
  });
  

  const handleSwap = async () => {
    // Define WCRO address for the network (assuming this is your wrapped ETH equivalent)
    const WCRO = addresses[MAINNET_ID].tokens.WCRO;
    
    // Check if token A or B is ETH and use the WCRO address in the path
    const path = [
      isETH(tokenA) ? WCRO : tokenA,
      isETH(tokenB) ? WCRO : tokenB,
    ];
    
    if (isETH(tokenA)) {
      // If token A is ETH, use swapExactETHForTokens
      const parsedAmountBMin = parseUnits(amountB, decimalsB); // Minimum amount of token B to accept
      await swapExactETHForTokens(
        parsedAmountBMin,  // Min amount of tokens B to accept (with slippage)
        path,              // Path: [WCRO, tokenB]
        account,
        Math.floor(Date.now() / 1000) + 60 * 20,  // Deadline
        { value: parseUnits(amountA, 'ether') }   // Amount of ETH to send
      );
    } else if (isETH(tokenB)) {
      // If token B is ETH, use swapExactTokensForETH
      const parsedAmountA = parseUnits(amountA, decimalsA); // Amount of token A to swap
      await swapExactTokensForETH(
        parsedAmountA,
        0,  // Min amount of ETH to accept (with slippage)
        path,              // Path: [tokenA, WCRO]
        account,
        Math.floor(Date.now() / 1000) + 60 * 20  // Deadline
      );
    } else {
      // If neither token is ETH, use swapExactTokensForTokens
      const parsedAmountA = parseUnits(amountA, decimalsA); // Amount of token A to swap
      await swapExactTokensForTokens(
        parsedAmountA,
        0,  // Min amount of token B to accept (with slippage)
        path,              // Path: [tokenA, tokenB]
        account,
        Math.floor(Date.now() / 1000) + 60 * 20  // Deadline
      );
    }
  };
  
  
  

  const handleTokenSelect = (token) => {
    // handle the token selection
    handleCloseDialog(token); // this function now acts as the onSelect handler
  };

  const handleApprove = async (tokenAddress, tokenContract, setApproval) => {
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


  useEffect(() => {
    const fetchDetails = async () => {
      if (tokenContractA && tokenContractB && account) {
        try {
          const [allowanceA, allowanceB, decimalsA, decimalsB, symbolA, symbolB] = await Promise.all([
            tokenContractA.allowance(account, addresses[MAINNET_ID].router02),
            tokenContractB.allowance(account, addresses[MAINNET_ID].router02),
            tokenContractA.decimals(),
            tokenContractB.decimals(),
            tokenContractA.symbol(),
            tokenContractB.symbol()
          ]);

          setApprovalA(allowanceA.isZero());
          setApprovalB(allowanceB.isZero());
          setDecimalsA(decimalsA);
          setDecimalsB(decimalsB);
          setSymbolA(symbolA);
          setSymbolB(symbolB);
        } catch (error) {
          console.error("Error fetching token details", error);
        }
      }
    };

    fetchDetails();
  }, [tokenContractA, tokenContractB, account, tokenA, tokenB]);

  useEffect(() => {
    const fetchExpectedAmountB = async () => {
      const decimalsForTokenA = isETH(tokenA) ? DEFAULT_DECIMALS : decimalsA;
      const decimalsForTokenB = isETH(tokenB) ? DEFAULT_DECIMALS : decimalsB;
      console.log("a: ", amountA, decimalsForTokenA, tokenB);
      if (amountA && decimalsForTokenA) {  // Check if provider is defined
        const parsedAmountA = parseUnits(amountA, decimalsForTokenA);
        const uniswapV2RouterContract = new Contract(addresses[MAINNET_ID].router02, abis.router02, provider.getSigner());
        try {
          const amountsOut = await uniswapV2RouterContract.getAmountsOut(parsedAmountA, [effectiveTokenA, effectiveTokenB]);
          const expectedAmountB = formatUnits(amountsOut[1], decimalsB);
          setAmountB(expectedAmountB);

          // Adding a 2% slippage (98% of expectedAmountB)
          // const minAmountBWithSlippage = expectedAmountB.mul(98).div(100); 
          // Uncomment above line if you want to set the minimum amount with slippage

        } catch (error) {
          console.error('Error fetching expected amountB:', error);
        }
      }
    };

    fetchExpectedAmountB();
  }, [amountA, decimalsA, decimalsB, tokenA, tokenB, provider]);  // Include provider as a dependency

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
      <Typography variant="h6">Swap</Typography>
      <Grid container spacing={3}>
        {/* Input for token A */}
        <Grid item xs={12}>
          <TokenInput
            amount={amountA}
            setAmount={setAmountA}
            label="Amount"
            field="A"
            handlePercentage={handlePercentage}
            handleOpenDialog={handleOpenDialog}
            tokenContract={tokenContractA}
            symbol={symbolA}
          />
        </Grid>
        {/* Input for token B */}
        <Grid item xs={12}>
          <TokenInput
            amount={amountB}
            setAmount={setAmountB}
            label="Amount"
            field="B"
            handlePercentage={handlePercentage}
            handleOpenDialog={handleOpenDialog}
            tokenContract={tokenContractB}
            symbol={symbolB}
          />
        </Grid>
        <Grid item xs={12}>
          {((approvalA || approvalB) && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => {
                if (approvalA) handleApprove(tokenA, tokenContractA, setApprovalA);
                if (approvalB) handleApprove(tokenB, tokenContractB, setApprovalB);
              }}
              disabled={!account || swapTokensState.status === 'Mining' || approvalA || approvalB}
              >
              `Approve ${approvalA ? symbolA : ''} ${approvalB ? symbolB : ''}`
            </Button>
          )) || (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSwap}
                disabled={!account || swapTokensState.status === 'Mining' || approvalA || approvalB}
                              >
                Swap
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

export default Swap;