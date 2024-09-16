import React from 'react';
import { IconButton, Box } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

function HomeButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const shouldShowHomeButton = !['/signup', '/login', '/'].includes(location.pathname);

  const handleHomeClick = () => {
    navigate('/');
  };

  return shouldShowHomeButton ? (
    <IconButton
      color="primary"
      aria-label="home"
      sx={{
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
      onClick={handleHomeClick}
    >
      <Box
        component={HomeIcon}
        sx={{
          fontSize: 24,
          color: 'white',
        }}
      />
    </IconButton>
  ) : null;
}

export default HomeButton;
