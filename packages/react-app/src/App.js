import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { useCall, useEthers } from "@usedapp/core";

import Navbar from "./components/navbar";
import Swap from "./components/swap";
import Liquidity from "./components/liquidity";
import { Container } from "./components";

import { MAINNET_ID, addresses, abis } from "@uniswap-v2-app/contracts";
import GET_AGGREGATED_UNISWAP_DATA from "./graphql/subgraph";

function App() {
  const { error: contractCallError, value: reserves } = useCall({
    contract: new Contract(addresses[MAINNET_ID].pairs["DAI-WETH"], abis.pair),
    method: "getReserves",
    args: [],
  }) ?? {};

  const { loading, error: subgraphQueryError, data } = useQuery(GET_AGGREGATED_UNISWAP_DATA);

  useEffect(() => {
    if (subgraphQueryError) {
      console.error("Error while querying subgraph:", subgraphQueryError.message);
      return;
    }
    if (!loading && data && data.uniswapFactories) {
      console.log({ uniswapFactories: data.uniswapFactories });
    }
  }, [loading, subgraphQueryError, data]);

  return (
    <Router>
      <Container>
        <Navbar />
        <Routes>
          <Route path="/swap" element={<Swap />} />
          <Route path="/liquidity" element={<Liquidity />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
