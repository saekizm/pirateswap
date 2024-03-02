import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import Swap from "./components/swap";
import Liquidity from "./components/liquidity";
import { Container } from "./components";
import LandingPage from "./components/LandingPage";
import Sdabs from "./components/sdabs";
import Footer from "./components/Footer";
import Farms from "./components/Farms"
import Pools from "./components/Pools"
import { WhitelistPresale } from "./components/WhitelistPresale";

function App() {
  
  return (
    <Router>
      <Container>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/liquidity" element={<Liquidity />} />
          <Route path="/sdabs" element={<WhitelistPresale />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/pools" element={<Pools />} />
        </Routes>
        <Footer />
      </Container>
    </Router>
  );
}

export default App;
