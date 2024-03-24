import React, { useState, useEffect, useRef } from "react";
import classes from "./Chart.module.css";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

const Chart = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef(null);
  const handleLoad = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", handleLoad);
      return () => iframe.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <div style={{ marginBlock: "100px" }}>
      {!isLoaded && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              marginBottom: "35px",
            }}
            variant="h6"
            component="h4"
          >
            Loading Chart...
          </Typography>
          <CircularProgress color="warning" />
        </div>
      )}

      <div id={classes["dexscreener-embed"]}>
        <iframe
          src="https://dexscreener.com/cronos/0xa0f8ff1fa76262daff832c68e13875abb61b4ec2?embed=1&theme=dark&trades=0"
          title="dxscrSphere"
        ></iframe>
      </div>
    </div>
  );
};

export default Chart;
