import React, { useState } from 'react';
import { Container, Box, Typography, Button, AppBar, Toolbar, IconButton } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <AppBar position="static" >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mi Aplicación
          </Typography>
          <IconButton color="inherit" component={Link} to="/">
            Home
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        <Box sx={{ textAlign: 'center', marginTop: 4 }}>
          <Typography variant="h3" gutterBottom>
            Vite + React
          </Typography>
        </Box>
      </Container>
    </Router>
  );
}

export default App;