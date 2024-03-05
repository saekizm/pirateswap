import React, { useState, useEffect } from "react";
import { useEthers } from "@usedapp/core";
import { nftHoldingsContractAddress } from "../hooks/useNftHoldings";
import { shortenAddress } from "@usedapp/core";
import { getNftsForAddress } from "../utils/market_ethers";
import "./nufts.css";

// // Define contract address and ABI
// const contractAddress = '0xAE8663c0A83C0B0BE7c1c6960f0F42F2b529D749';

// const useStyles = makeStyles((theme) => ({
//   galleryContainer: {
//     maxWidth: "800px",
//     margin: "auto",
//   },
//   // image: {
//   //   width: "30vw",
//   //   height: "30vw",
//   //   display: "flex",
//   //   flexDirection: "column",
//   //   alignItems: "center",
//   //   borderRadius: "20px",
//   //   margin: "auto",
//   // },
// }));

export const NftHoldings = ({ walletAddress }) => {
  const { library: provider, account } = useEthers();
  // const classes = useStyles();
  const [nftImages, setNftImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Number of items to display per page

  const fecthNfts = async () => {
    const nfts = await getNftsForAddress({
      walletAddress: account,
      browserWeb3Provider: provider,
      limit: 0,
      contractAddress: nftHoldingsContractAddress,
    });
    return nfts;
  };

  useEffect(() => {
    const nftImageUrls = [];

    const fetchFunctions = async function () {
      const nfts = await fecthNfts();
      nfts.nfts.forEach((nft) => {
        nftImageUrls.push({
          src: nft.image,
          alt: nft.name,
          thumbnail: nft.image,
          caption: nft.name,
          loading: "lazy",
          longdesc: nft.contractAddress,
        });
      });
      setNftImages(nftImageUrls);
    };
    fetchFunctions();
  }, [account]);

  // Paginate the images
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = nftImages.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <section className="banner_section">
        <header className="banner">
          <div className="container-fluid">
            <nav className="navbar navbar-expand-lg custom_nav-container">
              <span>
                <h2>
                  {account
                    ? `Space Pirates Relegated to Your Control: ${shortenAddress(
                        account
                      )}`
                    : "Connect Wallet for Space Pirates Assignments!"}
                </h2>
              </span>
            </nav>
          </div>
        </header>
      </section>
      <section className="nufts_section">
        <div className="nft-gallery">
          {currentItems
            .filter((nft, index) => nft.longdesc !== "0x0")
            .map((image, index) => (
              <div key={index} className="nft-item">
                <div className="img-box">
                  <img
                    src={image.src}
                    alt={image.alt}
                    title={image.caption}
                    loading={image.loading}
                    longdesc={image.longdesc}
                  />
                </div>
                <div className="detail-box">
                  <a href={image.src} target="_blank" rel="noreferrer">
                    {image.alt}
                  </a>
                </div>
              </div>
            ))}
        </div>
      </section>
      <section className="pagination_section">
        <div className="pagination">
          {Array.from(
            { length: Math.ceil(nftImages.length / itemsPerPage) },
            (_, i) => (
              <button key={i} onClick={() => paginate(i + 1)}>
                {i + 1}
              </button>
            )
          )}
        </div>
      </section>
    </div>
  );
};
