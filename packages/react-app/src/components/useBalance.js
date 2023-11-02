import { useTokenBalance, useEtherBalance } from '@usedapp/core';


const useBalance = (tokenAddress, account) => {
    // If the tokenAddress is empty string, assume it's ETH and return ETH balance.
    const etherBalance = useEtherBalance(account);
    // We use tokenBalance only if tokenAddress is not the empty string.
    const tokenBalance = useTokenBalance(tokenAddress, account);

    // Return the appropriate balance based on whether tokenAddress is provided.
    return tokenAddress ? tokenBalance : etherBalance;
  };

  export default useBalance