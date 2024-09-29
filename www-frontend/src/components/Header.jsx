import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logout as LogoutIcon } from '@mui/icons-material';
import HomeButton from './HomeButton'; // Importamos el componente HomeButton

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const shouldShowHeader = location.pathname !== '/login' && location.pathname !== '/signup';

  return shouldShowHeader ? (
    <AppBar position="static" sx={{ mb: 2, backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Contenedor para los dos botones */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Botón de Home */}
          <HomeButton />
        </Box>

        {/* Botón de autenticación */}
        <IconButton
          edge="end"
          color="primary"
          aria-label="menu"
          sx={{
            backgroundColor: '#CFB523',
            color: 'white',
            borderRadius: '50%',
            width: 60,
            height: 45,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '16px',
            '&:hover': {
              backgroundColor: '#CFB523',
            },
          }}
          onClick={isAuthenticated ? handleLogout : handleLogin}
        >
          {isAuthenticated ? (
            <LogoutIcon />
          ) : (
            <Typography variant="body1" sx={{ color: 'white', fontSize: '14px' }}>
              Log in
            </Typography>
          )}
        </IconButton>
      </Toolbar>
    </AppBar>
  ) : null;
}

export default Header;
