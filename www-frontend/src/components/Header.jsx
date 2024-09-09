import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logout as LogoutIcon, Home as HomeIcon } from '@mui/icons-material';

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
    navigate('/');
  };

  const handleHome = () => {
    navigate('/');
  };

  const shouldShowHeader = location.pathname !== '/' && location.pathname !== '/signup';

  return shouldShowHeader ? (
    <AppBar position="static" sx={{ mb: 2, backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Toolbar>
        <IconButton
          edge="end"
          color="primary"
          aria-label="menu"
          sx={{
            position: 'absolute',
            right: 16,
            backgroundColor: '#CFB523',
            color: 'white',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '16px',
            '&:hover': {
              backgroundColor: '#CFB523',
            },
          }}
          onClick={isAuthenticated ? handleLogout : handleHome}
        >
          {isAuthenticated ? <LogoutIcon /> : <HomeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  ) : null;
}

export default Header;
