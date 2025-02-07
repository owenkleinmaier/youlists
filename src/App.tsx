// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import { PlaylistPage } from "./components/HomePage";
import { LoadingScreen } from "./components/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/playlist" element={<PlaylistPage />} />
        <Route path="/loading" element={<LoadingScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
