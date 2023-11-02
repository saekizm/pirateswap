import React, { useState, useEffect, useMemo } from 'react';
import { useEthers, useTokenBalance, useContractFunction, useEtherBalance } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { formatUnits, parseUnits, formatEther } from '@ethersproject/units';
import { Button, Grid, Typography, Container } from '@mui/material';
import { MAINNET_ID, addresses, abis } from "./contracts";
import TokenInput from "./TokenInput"
import { constants } from 'ethers';
import TokenDialog from './TokenDialog';
import useBalance from './useBalance';

const AddLiquidity = () => {
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

  const [pairContract, setPairContract] = useState(null);

  const DEFAULT_DECIMALS = 18;

  const effectiveTokenA = isETH(tokenA) ? addresses[MAINNET_ID].tokens.WCRO : tokenA;
  const effectiveTokenB = isETH(tokenB) ? addresses[MAINNET_ID].tokens.WCRO : tokenB;

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


  useEffect(() => {
    const fetchPairContract = async () => {
      // Check if the token addresses are set, and the provider is available
      if (effectiveTokenA && effectiveTokenB && provider) {


        // Create a contract instance for the factory
        const factoryContract = new Contract(addresses[MAINNET_ID].factory, abis.factory, provider.getSigner());
        // Fetch the pair address from the factory contract
        const pairAddress = await factoryContract.getPair(effectiveTokenA, effectiveTokenB);

        // Check if the pair address is not the zero address
        if (pairAddress !== constants.AddressZero) {
          // Create a contract instance for the pair
          const pairContract = new Contract(pairAddress, abis.pair, provider.getSigner());
          // Update the state with the pair contract
          setPairContract(pairContract);
        }
      }
    };

    // Call the function to fetch the pair contract
    fetchPairContract();
  }, [tokenA, tokenB, provider]);


  // ...

  useEffect(() => {
    const fetchRequiredAmountB = async () => {
      const decimalsForTokenA = isETH(tokenA) ? DEFAULT_DECIMALS : decimalsA;
      const decimalsForTokenB = isETH(tokenB) ? DEFAULT_DECIMALS : decimalsB;

      if (amountA && decimalsForTokenA != null && pairContract) {
        const parsedAmountA = parseUnits(amountA, decimalsForTokenA);
        const reserves = await pairContract.getReserves();
        const reserveA = reserves[0];
        const reserveB = reserves[1];
        if (!reserveA.isZero()) {
          const requiredAmountB = reserveB.mul(parsedAmountA).div(reserveA);
          const formattedAmountB = formatUnits(requiredAmountB, decimalsForTokenB);
          setAmountB(formattedAmountB);
        }
      }
    };

    fetchRequiredAmountB();
  }, [amountA, decimalsA, decimalsB, pairContract, tokenA, tokenB]);

  // Setup for adding liquidity
  const uniswapV2RouterContract = new Contract(addresses[MAINNET_ID].router02, abis.router02);
  const { send: addLiquidity, state: addLiquidityState } = useContractFunction(uniswapV2RouterContract, 'addLiquidity', {
    transactionName: 'Add Liquidity',
  });
  const { send: addLiquidityETH, state: addLiquidityETHState } = useContractFunction(uniswapV2RouterContract, 'addLiquidityETH', {
    transactionName: 'Add LiquiditETH',
  });

  const handleAddLiquidity = async () => {
    // Parse the amounts for tokens A and B
    const parsedAmountA = parseUnits(amountA, isETH(tokenA) ? 'ether' : decimalsA);
    const parsedAmountB = parseUnits(amountB, isETH(tokenB) ? 'ether' : decimalsB);

    if (isETH(tokenA)) {
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
    } else if (isETH(tokenB)) {
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
        {/* Add liquidity button */}
        <Grid item xs={12}>
          {(approvalA || approvalB) ? (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => {
                if (approvalA) handleApprove(tokenA, tokenContractA, setApprovalA);
                if (approvalB) handleApprove(tokenB, tokenContractB, setApprovalB);
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

