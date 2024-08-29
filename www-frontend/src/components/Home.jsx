import React from 'react';
import { Container, Typography, Box, TextField, Button, Link, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo_beercheers.png';

function Home() {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 8,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={() => navigate('/bars')}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            margin: 1,
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{ width: 200, height: 'auto', marginBottom: 2 }}
        />
        
        <Box
          component="form"
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Handle or Email"
            autoComplete="email"
            autoFocus
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Link href="" variant="body2">
              Forgot password?
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Crear Registro
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
