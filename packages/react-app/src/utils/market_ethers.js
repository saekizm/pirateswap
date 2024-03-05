import { ethers, Contract } from "ethers";
import { Cronos } from "@usedapp/core";
import { MAINNET_ID } from "../components/contracts/src";
import erc721abi from "../components/contracts/src/abis/erc721abi.json";

// import CancellationToken from "cancellationtoken";

const IPFSGatewayTools = require("@pinata/ipfs-gateway-tools/dist/browser");

export const ipfsGateway = "https://gateway.pinata.cloud";
export const ipfsSphereGateway = "https://sphere.mypinata.cloud";
export const MISSING_ATTRIBUTE_VALUE = "[Missing]";

const gatewayTools = new IPFSGatewayTools();
const gateway = ipfsGateway;

export type NFT = {
  id: number,
  index: number,
  contractAddress: string,
  tokenId: string,
  owner: string,
  name: string,
  description: string,
  properties: any,
  colors?: { color: string }[],
  image: string,
  url: string,
  onChainTempImage?: string,
  thumbnail?: string,
  issuedId: string | null,
  itemId: string | null,
  network: string,
  chainId: number,
  createdAt: number,
  creator: string,
  updatedAt: number,
  walletAllowance: number,
  canTransfer: boolean,
  // rarity?: Rarity;
  rarityScore?: number,
  rank?: number,
  isStaked?: boolean,
  multiToken: boolean,
  // nftTxHistory?: NFTTxHistory;
  txReceipts?: ethers.providers.TransactionReceipt[],
  contract?: ethers.Contract,
  // viewState?: NFTViewStates;
  // marketData?: {
  //   totalVisitCount?: number;
  //   walletVisitCount?: number;
  //   bidCurrentHighPrice?: number;
  //   bidCurrentHighBidder?: string;
  //   bidPrice?: number; //temp field for bid/list input prices
  //   price?: string;
  //   saleTimestamp?: number;
  //   listTimestamp?: number;
  //   listExpireTimestamp?: number;
  //   activeBids?: ListingBids[];
  //   isOnSale?: boolean; // calculated from activeBids
  //   canSell?: boolean;
  //   daysAmount?: number; //temp field for bid/list duration
  // };
};

export interface INFTCollection {
  id: number;
  name: string;
  multiToken: boolean;
  traits?: any;
  traitsFilter?: any;
  // rarityDocument?: INftProjectRarityDocument;
  // nftContract: IQueryNFTContractData;
  // stakingContract?: IQueryNFTStakingContractData;
  // status: NFTCollectionStatus;
  onChain: boolean;
  isMinting: boolean; //collection is available for minting if also onChain
  listable: boolean; //market is open for collection
  // listingTypesFilter?: ListingTypes;
  priceMinFilter?: number;
  priceMaxFilter?: number;
  dataFetchBlockNumber?: number;
  marketData?: {
    tokenIdsByPopularity?: number[],
    tokenIdsBySales?: number[],
    tokenIdsByListing?: number[],
    tokenIdsByListingPrice?: number[],
    count24HourSales?: number,
    sum24HourSales?: number,
    avg24HourSales?: number,
    countWeekSales?: number,
    sumWeekSales?: number,
    avgWeekSales?: number,
    countYearSales?: number,
    sumYearSales?: number,
    avgYearSales?: number,
    countMarketSales?: number,
    sumMarketSales?: number,
    avgMarketSales?: number,
    collectionFloor?: number,
    visitCount?: number,

    royalty?: number,
    royaltyContractSet?: boolean,
    serviceFee?: number,
    //   paymentToken?: Token;
    countOfItemsWithBids?: number,
    countOfListings?: number,
    walletApproval?: number,
  };
  metadata: {
    slug: string,
    description: string,
    verified: boolean,
    avatar?: any, //expected types are string and image from the application project files
    //nft in nature, and appears on minting area as well
    banner?: string,
    icon?: string, //small version of logo used to represent collection branding
    logo?: string, //larger version of collection branding, similar to avatar
    card?: string,
    //   rarityProvider?: rarityProviders;
    maxSupply: number,
    maxSupplyContractSet?: boolean,
    totalSupply: number, //will track active tokens held on contract during <mint />
    //at start should be the same as metadata.totalSupply.  However, available may
    //appear different when first mint if things like private sales take place.
    minTokenId?: number,
    maxTokenId?: number,
    storyline: string,
    webSite?: string,
    discord?: string,
    twitter?: string,
    medium?: string,
    telegram?: string,
    instagram?: string,
    wiki?: string,
    ipfsGateway?: string,
  };
  // mintData?: IMintInfo;
}

export const defaultNFT: NFT = {
  id: 0,
  index: 0,
  contractAddress: "0x0",
  tokenId: "0",
  owner: "",
  name: "",
  image: "",
  description: "",
  url: "",
  properties: [{ trait_type: "", value: "" }],
  thumbnail: "",
  issuedId: "",
  itemId: "",
  network: Cronos.chainName,
  chainId: 0,
  createdAt: 0,
  creator: "",
  updatedAt: 0,
  walletAllowance: 0,
  canTransfer: false,
  // rarity: Rarity.COMMON,
  isStaked: false,
  multiToken: false,
};

interface GetNftsForAddress {
  // dispatch: any;
  // collections: INFTCollection[];
  walletAddress: string;
  browserWeb3Provider: ethers.providers.Web3Provider;
  // token: CancellationToken;
  limit: number;
  contractAddress?: string;
}

export const getNftsForAddress = async ({
  // dispatch,
  // collections,
  walletAddress,
  browserWeb3Provider,
  // token,
  limit,
  contractAddress,
}: GetNftsForAddress) => {
  let nftResponse = { nfts: [] };

  if (!walletAddress || !browserWeb3Provider) {
    return { nfts: [defaultNFT] };
  }
  const ethersProvider = browserWeb3Provider.getSigner();

  try {
    let forLimit = 0;
    const erc721Contract = new Contract(
      typeof contractAddress == "undefined" ? "0x" : contractAddress,
      erc721abi,
      ethersProvider
    );
    erc721Contract.connect(ethersProvider);

    let count = await erc721Contract.balanceOf(walletAddress);
    count = count.toNumber();
    let ids = [];
    if (count > 0) {
      try {
        // await erc721Contract.tokenOfOwnerByIndex(walletAddress, 0);
        ids = await erc721Contract.walletOfOwner(walletAddress);
      } catch (error) {}
    }
    //allows a break in collection of nfts set by caller in addition to token cancel
    forLimit = limit > 0 ? limit : count;

    for (
      let i = 0;
      i < count && i < forLimit; // && !token.isCancelled;
      i++
    ) {
      let canTransfer = true;
      let id = ids[i];

      const uri = await (async () => {
        return await erc721Contract.tokenURI(id);
      })();

      const checkedUri = (() => {
        try {
          if (gatewayTools.containsCID(uri) && !uri.startsWith("ar")) {
            return gatewayTools.convertToDesiredGateway(uri, gateway);
          }

          if (uri.startsWith("ar")) {
            return `https://arweave.net/${uri.substring(5)}`;
          }

          return uri;
        } catch (error) {
          return uri;
        }
      })();

      let json;
      const tokenId = id.toString();

      json = await (await fetch(checkedUri)).json();

      let image;
      if (json.image.startsWith("ipfs")) {
        image = `${gateway}/ipfs/${json.image.substring(7)}`;
      } else if (
        gatewayTools.containsCID(json.image) &&
        !json.image.startsWith("ar")
      ) {
        try {
          image = gatewayTools.convertToDesiredGateway(json.image, gateway);
        } catch (error) {
          image = json.image;
        }
      } else if (json.image.startsWith("ar")) {
        if (typeof json.tooltip !== "undefined") {
          image = `https://arweave.net/${json.tooltip.substring(5)}`;
        } else {
          image = `https://arweave.net/${json.image.substring(5)}`;
        }
      } else {
        image = json.image;
      }

      const propertiesSearch = !!json.properties
        ? json.properties &&
          json.properties.category !== undefined &&
          json.properties.category !== "image"
          ? json.properties
          : json.attributes
        : !!json.attributes
        ? json.attributes
        : !!json.level
        ? [
            {
              trait_type: "level",
              value: json.level.toString(),
            },
          ]
        : [
            {
              trait_type: MISSING_ATTRIBUTE_VALUE,
              value: MISSING_ATTRIBUTE_VALUE,
            },
          ];

      const nft: NFT = {
        id: Number(tokenId),
        index: i,
        contractAddress: erc721Contract.address,
        tokenId: tokenId,
        owner: walletAddress,
        name: json.name,
        description: json.description,
        properties: propertiesSearch,
        image: image,
        url: uri.toString(),
        issuedId: null,
        itemId: null,
        network: Cronos.chainName,
        chainId: MAINNET_ID,
        createdAt: 0,
        creator: "",
        updatedAt: 0,
        canTransfer: canTransfer,
        walletAllowance: 0,
        multiToken: false,
        contract: erc721Contract,
      };
      nftResponse.nfts.push(nft);
      //if (!token.isCancelled) {
      // nftsUpdate(dispatch, collections, nft);
      //}
    }

    // if (token.isCancelled) {
    //   break;
    // }
  } catch (error) {
    // await delay(250);
    console.log("error fetching ");
    console.log(error);
  }

  // );

  return nftResponse;
};
