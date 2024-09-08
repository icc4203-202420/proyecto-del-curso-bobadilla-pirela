import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const HomeButton = () => {
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(token)
      if (!token) {
        console.error("No token found.");
        return;
      }

      const response = await fetch('/api/api/v1/logout', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        const errorData = await response.json();
        console.error("Logout failed:", errorData);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: '#CFB523',
          color: 'white',
          borderRadius: '10%',
          width: 100,
          height: 50,
          minWidth: 0,
          '&:hover': {
            backgroundColor: '#b1971b',
          }
        }}
        onClick={handleLogOut}
      >
        <HomeIcon />
        LogOut
      </Button>
    </div>
  );
};

export default HomeButton;
