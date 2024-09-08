import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const Navbar = () => {
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
    <BottomNavigation sx={{ backgroundColor: '#303030', color: '#CFB523', borderTop: '2px solid #CFB523' }}>
      <BottomNavigationAction onClick={() => navigate('/bars')} label="Home" icon={
        <Box
          component="img"
          src={HomeIcon}
          alt="Bars"
          sx={{ width: 72, height: 70 }}
        />
      } />
      <BottomNavigationAction onClick={() => navigate('/beers')} label="Search" icon={
        <Box
          component="img"
          src={SearchIcon}
          alt="Search"
          sx={{ width: 32, height: 26 }}
        />
      }/>
      <BottomNavigationAction onClick={() => navigate('/bars')} label="Map" icon={<MapIcon />} sx={{ color: '#E3E5AF' }} />
      <BottomNavigationAction onClick={() => navigate('/search-users')} label="User" icon={<PersonIcon />} sx={{ color: '#CFB523' }} />
    </BottomNavigation>
  </Box>
};

export default HomeButton;
