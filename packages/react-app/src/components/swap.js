import React, { useState, useEffect, useMemo } from 'react';
import { useEthers, useTokenBalance, useContractFunction, useEtherBalance } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Button, Grid, Typography, Container, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { MAINNET_ID, addresses, abis } from "./contracts";
import TokenInput from "./TokenInput"
import { constants, BigNumber } from 'ethers';
import TokenDialog from './TokenDialog';
import useBalance from '../hooks/useBalance';
import { SettingModal } from './SettingModal';

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
  const isETH = (symbol) => symbol === 'CRO';
  const [symbolA, setSymbolA] = useState(null)
  const [symbolB, setSymbolB] = useState(null)
  const tokenABalance = useBalance(tokenA, symbolA, account);
  const tokenBBalance = useBalance(tokenB, symbolB, account);
  const [decimalsA, setDecimalsA] = useState(null);
  const [decimalsB, setDecimalsB] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    gasSpeed: 'Standard',
    slippage: '',
    deadline: ''
  });



  const uniswapV2RouterContract = new Contract(addresses[MAINNET_ID].router02, abis.router02, provider);

  const tokenContractA = useMemo(() => {
    if (!provider || !tokenA || isETH(symbolA)) return null;
    return new Contract(tokenA, abis.erc20.abi, provider.getSigner());
  }, [tokenA, provider, symbolA]);

  const tokenContractB = useMemo(() => {
    if (!provider || !tokenB || isETH(symbolB)) return null;
    return new Contract(tokenB, abis.erc20.abi, provider.getSigner());
  }, [tokenB, provider, symbolB]);

  const { send: swapExactETHForTokens } = useContractFunction(uniswapV2RouterContract, 'swapExactETHForTokens', {
    transactionName: 'Swap ETH for Tokens',
  });

  const { send: swapExactTokensForETH } = useContractFunction(uniswapV2RouterContract, 'swapExactTokensForETH', {
    transactionName: 'Swap Tokens for ETH'
  });

  const { send: swapExactTokensForETHSupportingFeeOnTransferTokens } = useContractFunction(uniswapV2RouterContract, 'swapExactTokensForETHSupportingFeeOnTransferTokens', {
    transactionName: 'Swap Tokens for ETH Supporting Fee On Transfer Tokens',
  });

  const { send: swapExactTokensForTokens, state: swapTokensState } = useContractFunction(uniswapV2RouterContract, 'swapExactTokensForTokens', {
    transactionName: 'Swap Tokens for Tokens',
  });



  useEffect(() => {
    if (tokenContractA && account && amountA) {
      const checkApprovalA = async () => {
        const allowance = await tokenContractA.allowance(account, addresses[MAINNET_ID].router02);
        setApprovalA(allowance.lt(parseUnits(amountA, decimalsA)));
      };

      checkApprovalA();
    }

    if (tokenContractB && account && amountB) {
      const checkApprovalB = async () => {
        const allowance = await tokenContractB.allowance(account, addresses[MAINNET_ID].router02);
        setApprovalB(allowance.lt(parseUnits(amountB, decimalsB)));
      };

      checkApprovalB();
    }
  }, [provider, account, tokenA, tokenB, tokenContractA, tokenContractB, amountA, amountB, decimalsA, decimalsB]);



  const getAmount = async (value, field) => {
    // take the value, call get amounts out
    // return them
    if (field === 'A' && value) {
      const amountsOut = await uniswapV2RouterContract.getAmountsOut(parseUnits(value, decimalsA), [tokenA, tokenB]);
      console.log(amountsOut)
      return ({ amountA: value, amountB: formatUnits(amountsOut[1], decimalsB) })
    }
    else if (field === 'B' && value) {
      const parsedAmountB = parseUnits(value, decimalsB);
      const amountsIn = await uniswapV2RouterContract.getAmountsIn(parsedAmountB, [tokenA, tokenB]);
      return ({ amountA: formatUnits(amountsIn[0], decimalsA), amountB: value })
    }

  }

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
    console.log(balance, decimals)
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

  const handleOpenDialog = (field) => {
    setTokenField(field);
    setOpenDialog(true);
  };

  const handleCloseDialog = (token) => {
    setOpenDialog(false);
    if (token) {
      if (tokenField === 'A') {
        setApprovalA(false);
        setTokenA(token.address);
        setSymbolA(token.symbol);
        setDecimalsA(token.decimals);
        setAmountA('');
        setAmountB('');

      } else {
        setApprovalB(false);
        setTokenB(token.address);
        setSymbolB(token.symbol);
        setDecimalsB(token.decimals);
        setAmountB('');
        setAmountA('');
      }
          }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };


  const handleSwap = async () => {
    // Define WCRO address for the network
    const WCRO = addresses[MAINNET_ID].tokens.WCRO;

    // Extract settings
    const { slippage, deadline } = settings;

    // Calculate slippage tolerance and deadline
    const slippageTolerance = slippage ? parseFloat(slippage) / 100 : 0.01; // Default to 1%
    const swapDeadline = deadline ? parseInt(deadline) * 60 : 1200; // Default to 20 minutes

    // Check if token A or B is ETH and use the WCRO address in the path
    const path = [
      isETH(symbolA) ? WCRO : tokenA,
      isETH(symbolB) ? WCRO : tokenB,
    ];

    // Convert the deadline to a UNIX timestamp
    const deadlineTimestamp = Math.floor(Date.now() / 1000) + swapDeadline;

    try {
      if (isETH(symbolA)) {
        const amountAInWei = parseUnits(amountA, 'ether'); // ETH has 18 decimal places
        const amountBMin = calculateMinAmount(amountB, decimalsB, slippageTolerance);

        await swapExactETHForTokens(
          amountBMin,
          path,
          account,
          deadlineTimestamp,
          { value: amountAInWei }
        );
      } else if (isETH(symbolB)) {
        const parsedAmountA = parseUnits(amountA, decimalsA);
        const amountETHMin = calculateMinAmount(amountB, decimalsB, slippageTolerance);


        await swapExactTokensForETHSupportingFeeOnTransferTokens(
          parsedAmountA,
          amountETHMin,
          path,
          account,
          deadlineTimestamp,
          {gasLimit: 300000}
        );
      } else {
        const parsedAmountA = parseUnits(amountA, decimalsA);
        const amountBMin = calculateMinAmount(amountB, decimalsB, slippageTolerance);

        await swapExactTokensForTokens(
          parsedAmountA,
          amountBMin,
          path,
          account,
          deadlineTimestamp
        );
      }
    } catch (error) {
      console.log(tokenA, tokenB, amountA, amountB, decimalsA, decimalsB);
      console.error("Swap failed:", error);
    }
  };


  // Helper function to calculate minimum amount based on slippage
  function calculateMinAmount(amount, decimals, slippageTolerance) {
    const amountBN = parseUnits(amount, decimals);
    const slippageBN = BigNumber.from(Math.round(slippageTolerance * 10000));
    return amountBN.sub(amountBN.mul(slippageBN).div(10000));
  }


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
      <IconButton
        onClick={() => setIsSettingsOpen(true)}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <SettingsIcon />
      </IconButton>
      <SettingModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={handleSettingsChange}
      />
      <Typography variant="h6">Swap</Typography>
      <Grid container spacing={3}>
        {/* Input for token A */}
        <Grid item xs={12}>
          <TokenInput
            amount={amountA}
            setAmountA={setAmountA} // Correct prop for setting amountA
            setAmountB={setAmountB} // Correct prop for setting amountB
            label="Amount"
            field="A"
            getAmount={getAmount} // Function to get corresponding amounts
            handlePercentage={handlePercentage}
            handleOpenDialog={() => handleOpenDialog('A')} // Adjusted to pass field directly
            symbol={symbolA}
          />
        </Grid>
        {/* Input for token B */}
        <Grid item xs={12}>
          <TokenInput
            amount={amountB}
            setAmountA={setAmountA} // Correct prop for setting amountA
            setAmountB={setAmountB} // Correct prop for setting amountB
            label="Amount"
            field="B"
            getAmount={getAmount} // Function to get corresponding amounts
            handlePercentage={handlePercentage}
            handleOpenDialog={() => handleOpenDialog('B')} // Adjusted to pass field directly
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
                if (approvalA) handleApprove(tokenContractA, setApprovalA);
                if (approvalB) handleApprove(tokenContractB, setApprovalB);
              }}
              disabled={!account || swapTokensState.status === 'Mining'}
            >
              Approve ${approvalA ? symbolA : ''} {approvalB ? symbolB : ''}
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