import React, { useEffect, useState } from 'react';
import { Container, Box, TextField, List, ListItem, ListItemText, ListItemIcon, Typography, BottomNavigation, BottomNavigationAction, Button } from '@mui/material';
import main_icon from '../assets/icon_beercheers.png';
import axios from 'axios';
import { ChevronRight } from '@mui/icons-material';
import HomeIcon from '../assets/baricon.png';
import SearchIcon from '../assets/searchgray.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

function BarsIndex() {
  const [bars, setBars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/api/api/v1/bars')
      .then(response => {
        setBars(response.data.bars || []);
      })
      .catch(error => {
        console.error("No se pudieron capturar los bars!", error);
      });
  }, []);

  const filteredBars = bars.filter(bar =>
    bar.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        favorite bar
      </Typography>

      <Box
        component="form"
        noValidate
        sx={{ mt: 4 }}
      >
        <TextField
          id="filled-basic"
          variant="filled"
          fullWidth
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
        {Array.isArray(filteredBars) && filteredBars.map(bar => (
          <ListItem
            key={bar.id}
            sx={{
              justifyContent: 'center',
              display: 'flex',
              color: 'white',
            }}
            onClick={() => navigate(`/bars/${bar.id}/events`)}
          >
            <ListItemText
              primary={bar.name}
              secondary={
                <Typography variant="body2" sx={{ color: '#CFB523' }}>
                  {bar.address && (
                    <>
                      {bar.address.line1} {bar.address.line2 && `, ${bar.address.line2}`}<br />
                      {bar.address.city}{bar.address.country && `, ${bar.address.country}`}
                    </>
                  )}
                </Typography>
              }
              sx={{ textAlign: 'left', color: 'white' }}
            />
            <ListItemIcon edge="end">
              <ChevronRight sx={{ color: 'white', marginLeft: '22px' }} />
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
          } />
          <BottomNavigationAction onClick={() => navigate('/bars-index-map')} label="Map" icon={<MapIcon />} sx={{ color: '#E3E5AF' }} />
          <BottomNavigationAction onClick={() => navigate('/search-users')} label="User" icon={<PersonIcon />} sx={{ color: '#E3E5AF' }} />
        </BottomNavigation>
      </Box>
    </Container>
  );
}

export default BarsIndex;