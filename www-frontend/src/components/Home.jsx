import React from 'react';
import { Container, Box, Typography } from '@mui/material';

function Home() {
  return (
    <Container>
      <Box sx={{ textAlign: 'center', marginTop: 4 }}>
        <Typography variant="h3" gutterBottom>
          Bienvenido a la App de Cervezas
        </Typography>
        <Typography variant="h6">
          Explora cervezas, bares, eventos y más.
        </Typography>
      </Box>
    </Container>
  );
}

export default Home;