import React from 'react';
import { Container, Box, Typography, Button, AppBar, Toolbar, IconButton } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import './App.css'
import BarsIndex from './components/BarsIndex';
import BeersIndex from './components/BeersIndex';

function App() {

  return (
    <Router>
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/beers" element={<BeersIndex />} />
          <Route path="/bars" element={<BarsIndex />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;