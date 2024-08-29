import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="contained"
      sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#CFB523',
        color: 'white',
        borderRadius: '50%',
        width: 50,
        height: 50,
        minWidth: 0,
        '&:hover': {
          backgroundColor: '#b1971b',
        }
      }}
      onClick={() => navigate('/')}
    >
      <HomeIcon />
    </Button>
  );
};

export default HomeButton;
