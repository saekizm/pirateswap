import "./index.css";

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { Cronos, DAppProvider } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import * as Sentry from "@sentry/react";
import App from "./App";

Sentry.init({
  dsn: "https://8a2bbfd27556440f93af72f05df58caf@o4504562129174528.ingest.sentry.io/4504562134876160",
  integrations: [new Sentry.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/spacepirates\.finance/,
    /^https:\/\/rpc.spacepirates\.finance/,
    /^https:\/\/rpcx.spacepirates\.finance/,
    /^https:\/\/rpc\.spacepirates\.finance\/graphbase/,
    /^https:\/\/rpcg\.spacepirates\.finance\/graphbase/,
  ],
});

// IMPORTANT, PLEASE READ
// To avoid disruptions in your app, change this to your own Infura project id.
// https://infura.io/register
// const INFURA_PROJECT_ID = "529670718fd74cd2a041466303daecd7";
const config = {
  readOnlyChainId: Cronos.chainId,
  readOnlyUrls: {
    // [Cronos.chainId]: "https://rpc-us.spherevaults.com",
    [Cronos.chainId]: "https://evm-cronos.crypto.org",
  },
};
const link = new HttpLink({
  uri: "https://rpcg.spacepirates.finance/graphbase/subgraphs/name/pswap/factorypair",
});
// This is the official Uniswap v2 subgraph. You can replace it with your own, if you need to.
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  ssrMode: true,
  link: link,
});

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
