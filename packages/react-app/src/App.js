import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import Swap from "./components/swap";
import Liquidity from "./components/liquidity";
import { Container } from "./components";
import LandingPage from "./components/LandingPage";

function App() {
  
  return (
    <Router>
      <Container>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/liquidity" element={<Liquidity />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
