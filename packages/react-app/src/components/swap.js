import React, {useState, useEffect, useMemo} from 'react';
import { useEthers, useTokenBalance, useContractFunction } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Button, Grid, Typography, Container} from '@mui/material';
import { MAINNET_ID, addresses, abis } from "./contracts";
import TokenInput from "./TokenInput"
import { constants } from 'ethers';
import TokenDialog from './TokenDialog';

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

  const tokenContractA = useMemo(() => tokenA ? new Contract(tokenA, abis.erc20.abi, provider.getSigner()) : null, [tokenA, provider]);
  const tokenContractB = useMemo(() => tokenB ? new Contract(tokenB, abis.erc20.abi, provider.getSigner()) : null, [tokenB, provider]);

  const tokenABalance = useTokenBalance(tokenA, account);
  const tokenBBalance = useTokenBalance(tokenB, account);
  const [decimalsA, setDecimalsA] = useState(null);
  const [decimalsB, setDecimalsB] = useState(null);
  const [symbolA, setSymbolA] = useState(null)
  const [symbolB, setSymbolB] = useState(null)

  // Handler for maximum balance
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

  const { send: swapTokens, state: swapState } = useContractFunction(uniswapV2RouterContract, 'swapExactTokensForTokens', {
    transactionName: 'Swap Tokens',
  });

  const handleSwap = async () => {
    if (!tokenContractA.decimals || !tokenContractB.decimals) {
      console.error("Token decimals not available");
      return;
    }

    const parsedAmountA = parseUnits(amountA, decimalsA);

    await swapTokens(
      parsedAmountA,
      0,  // minimum amount of tokens B to accept
      [tokenA, tokenB],  // path
      account,
      Math.floor(Date.now() / 1000) + 60 * 20  // deadline: 20 minutes from the current Unix time
    );
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
      if (amountA && decimalsA && tokenA && tokenB && provider) {  // Check if provider is defined
        const parsedAmountA = parseUnits(amountA, decimalsA);
        const uniswapV2RouterContract = new Contract(addresses[MAINNET_ID].router02, abis.router02, provider.getSigner());
        try {
          const amountsOut = await uniswapV2RouterContract.getAmountsOut(parsedAmountA, [tokenA, tokenB]);
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
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={approvalA || approvalB ? () => {
              if (approvalA) handleApprove(tokenA, tokenContractA, setApprovalA);
              if (approvalB) handleApprove(tokenB, tokenContractB, setApprovalB);
            } : handleSwap}
            disabled={!account || swapState.status === 'Mining' || !(approvalA && approvalB)}
          >
            {(approvalA || approvalB) ? `Approve ${approvalA ? symbolA : ''} ${approvalB ? symbolB : ''}` : 'Swap'}
          </Button>
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