import React, { useEffect, useState } from 'react';
import { Container, Box, TextField, List, ListItem, ListItemText, ListItemIcon, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import main_icon from '../assets/icon_beercheers.png';
import axios from 'axios';
import { ChevronRight } from '@mui/icons-material';
import HomeIcon from '../assets/baricon_gray.png';
import SearchIcon from '../assets/searchyellow.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

function BeersIndex() {
  const [beers, setBeers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://192.168.100.13:3001/api/v1/beers')
      .then(response => {
        console.log(response.data);
        setBeers(response.data.beers || []);
      })
      .catch(error => {
        console.error("No se pudieron capturar las beers!", error);
      });
  }, []);

  const filteredBeers = beers.filter(beer =>
    beer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container component="main" maxWidth="md">
      <Box
        component="img"
        src={main_icon}
        alt="Icon"
        sx={{ width: 100, height: 'auto', marginBottom: 1 }}
      />

      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: 'white',
          textAlign: 'center',
          mt: 2,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 900,
          fontSize: '50px',
          textShadow: '1px 3px 3px black',
          WebkitTextStroke: '1px black',
          MozTextStroke: '1px black',
        }}
      >
        Find your<br />
        favorite beer
      </Typography>

      <Box
        component="form"
        noValidate
        sx={{ mt: 4 }}
      >
        <TextField
          id="filled-basic"
          variant="filled"
          label="Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            backgroundColor: '#D9D9D9',
            borderRadius: '8px',
            '& .MuiInputBase-input': {
              color: '#606060',
            },
            '& .MuiInputLabel-root': {
              color: '#787878',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#787878',
            },
            '& .MuiFilledInput-root': {
              borderRadius: '8px',
              backgroundColor: '#D9D9D9',
            },
            '& .MuiFilledInput-root:before': {
              borderColor: '#303030',
            },
            '& .MuiFilledInput-root:hover:before': {
              borderColor: '#303030',
            },
            '& .MuiFilledInput-root:after': {
              borderColor: '#303030',
            },
          }}
        />
      </Box>

      <List sx={{ textAlign: 'left', color: 'white' }}>
        {Array.isArray(filteredBeers) && filteredBeers.map(beer => (
          <ListItem
            key={beer.id}
            sx={{
              justifyContent: 'center',
              display: 'flex-start',
              color: 'white',
            }}
            onClick={() => navigate(`/beers/${beer.id}`)}
          >
            <ListItemIcon>
              {beer.image ? (
                <Box
                  component="img"
                  src={beer.image}
                  alt={beer.name}
                  sx={{ width: 50, height: 50, borderRadius: '50%' }}
                />
              ) : (
                <Box
                  component="div"
                  sx={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'grey' }}
                />
              )}
            </ListItemIcon>
            <ListItemText primary={beer.name} secondary={beer.style} sx={{ textAlign: 'left', color: 'white', '& .MuiListItemText-secondary': { color: '#FFD700', },}}/>
            <ListItemIcon edge="center">
              <ChevronRight sx={{ color: 'white'}} />
            </ListItemIcon>
          </ListItem>
        ))}
      </List>

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
          <BottomNavigationAction onClick={() => navigate('/bars-index-map')} label="Map" icon={<MapIcon />} sx={{ color: '#E3E5AF' }} />
          <BottomNavigationAction onClick={() => navigate('/search-users')} label="User" icon={<PersonIcon />} sx={{ color: '#E3E5AF' }} />
        </BottomNavigation>
      </Box>
    </Container>
  );
}

export default BeersIndex;
