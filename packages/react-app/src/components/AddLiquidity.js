import React, { useState, useEffect, useMemo } from 'react';
import { useEthers, useTokenBalance, useContractFunction } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Button, Grid, Typography, Container } from '@mui/material';
import { MAINNET_ID, addresses, abis } from "./contracts";
import TokenInput from "./TokenInput"
import { constants, utils } from 'ethers';

// Include your TokenDialog component
import TokenDialog from './TokenDialog';


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


  const tokenContractA = useMemo(() => tokenA ? new Contract(tokenA, abis.erc20.abi, provider.getSigner()) : null, [tokenA, provider]);
  const tokenContractB = useMemo(() => tokenB ? new Contract(tokenB, abis.erc20.abi, provider.getSigner()) : null, [tokenB, provider]);

  const tokenABalance = useTokenBalance(tokenA, account);
  const tokenBBalance = useTokenBalance(tokenB, account);
  const [decimalsA, setDecimalsA] = useState(null);
  const [decimalsB, setDecimalsB] = useState(null);
  const [symbolA, setSymbolA] = useState(null)
  const [symbolB, setSymbolB] = useState(null)

  const [pairContract, setPairContract] = useState(null);


  const handlePercentage = async (field, percentage) => {
    const balance = field === 'A' ? tokenABalance : tokenBBalance;
    const decimals = field === 'A' ? decimalsA : decimalsB;
    if (balance && decimals) {
      const formattedBalance = formatUnits(balance.mul(percentage).div(100), decimals);
      if (field === 'A') {
        setAmountA(formattedBalance);
      } else {
        setAmountB(formattedBalance);
      }
    }
  };



  useEffect(() => {
    const fetchPairContract = async () => {
      if (tokenA && tokenB && provider) {
        const factoryContract = new Contract(addresses[MAINNET_ID].factory, abis.factory, provider.getSigner());
        const pairAddress = await factoryContract.getPair(tokenA, tokenB);
        if (pairAddress !== utils.getAddress('0x0000000000000000000000000000000000000000')) {
          const pairContract = new Contract(pairAddress, abis.pair, provider.getSigner());
          setPairContract(pairContract);
        }
      }
    };

    fetchPairContract();
  }, [tokenA, tokenB, provider]);

  // New effect to calculate the required amount of token B when the amount of token A changes
  useEffect(() => {
    const fetchRequiredAmountB = async () => {
      if (amountA && decimalsA && pairContract) {
        const parsedAmountA = parseUnits(amountA, decimalsA);
        const reserves = await pairContract.getReserves();
        const reserveA = reserves[0];
        const reserveB = reserves[1];
        const requiredAmountB = reserveB.mul(parsedAmountA).div(reserveA);
        const formattedAmountB = formatUnits(requiredAmountB, decimalsB);
        setAmountB(formattedAmountB);
      }
    };

    fetchRequiredAmountB();
  }, [amountA, decimalsA, decimalsB, pairContract]);

  // Setup for adding liquidity
  const uniswapV2RouterContract = new Contract(addresses[MAINNET_ID].router02, abis.router02);
  const { send: addLiquidity, state: addLiquidityState } = useContractFunction(uniswapV2RouterContract, 'addLiquidity', {
    transactionName: 'Add Liquidity',
  });

  const handleAddLiquidity = async () => {
    // Implementation of liquidity adding, considering minimum received and deadline values.
    // Here, you can also add pre-check conditions or set specific values before sending the transaction.
    if (!tokenContractA.decimals || !tokenContractB.decimals) {
      console.error("Token decimals not available");
      return;
    }
    else {
      console.log(decimalsA, decimalsB)
    }

    // Convert token amounts for transaction
    const parsedAmountA = parseUnits(amountA, decimalsA);
    const parsedAmountB = parseUnits(amountB, decimalsB);

    await addLiquidity(
      tokenA,
      tokenB,
      // Sending the actual token amounts requires considering the token's decimal count.
      // For simplicity, let's assume it's 18 decimals for both tokens.
      // In production, ensure to handle tokens with different decimal values appropriately.
      parsedAmountA,
      parsedAmountB,
      0,  // Here, you might want to add logic for minimum amount or slippage
      0,  // Same as above
      account,
      Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    );
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

