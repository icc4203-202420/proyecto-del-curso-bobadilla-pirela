import React from 'react';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '../assets/baricon_gray.png';
import SearchIcon from '../assets/searchgray.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 4
      }}
    >
      <Card sx={{ width: 300, backgroundColor: '#303030', color: '#E3E5AF' }}>
        <CardActionArea onClick={() => navigate('/bars')}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={HomeIcon}
              alt="Home"
              sx={{ width: 120, height: 120 }}
            />
            <Typography variant="h6">Bars</Typography>
          </CardContent>
        </CardActionArea>
      </Card>

      <Card sx={{ width: 300, backgroundColor: '#303030', color: '#E3E5AF' }}>
        <CardActionArea onClick={() => navigate('/beers')}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={SearchIcon}
              alt="Search"
              sx={{ width: 80, height: 60 }}
            />
            <Typography variant="h6">Search</Typography>
          </CardContent>
        </CardActionArea>
      </Card>

      <Card sx={{ width: 300, backgroundColor: '#303030', color: '#E3E5AF' }}>
        <CardActionArea onClick={() => navigate('/bars-index-map')}>
          <CardContent sx={{ textAlign: 'center' }}>
            <MapIcon sx={{ fontSize: 100 }} />
            <Typography variant="h6">Map</Typography>
          </CardContent>
        </CardActionArea>
      </Card>

      <Card sx={{ width: 300, backgroundColor: '#303030', color: '#E3E5AF' }}>
        <CardActionArea onClick={() => navigate('/search-users')}>
          <CardContent sx={{ textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 100 }} />
            <Typography variant="h6">User</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
};

export default Home;
