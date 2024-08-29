import React, { useEffect, useState } from 'react';
import { Container, Box, TextField, List, ListItem, ListItemText, ListItemIcon, Typography,  BottomNavigation, BottomNavigationAction, Button, Link, IconButton, FormControl, InputAdornment} from '@mui/material';
import main_icon from '../assets/icon_beercheers.png';
import axios from 'axios';
import { ChevronRight } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '../assets/searchyellow.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

function BeersIndex() {
  const [beers, setBeers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/api/api/v1/beers')
      .then(response => {
        console.log(response.data);
        setBeers(response.data.beers || []);
      })
      .catch(error => {
        console.error("No se pudieron capturar las beers!", error);
      });
  }, []);

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
          fontFamily: 'Roboto, sans-serif', // Fuente Roboto
          fontWeight: 900, // ExtraBold (800)
          fontSize: '50px', // Tamaño del texto
          textShadow: '1px 3px 3px black', // Sombra del texto
          WebkitTextStroke: '1px black', // Contorno del texto para WebKit (Chrome, Safari)
          MozTextStroke: '1px black', // Contorno del texto para Firefox
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
            fullWidth
            label="Name"
            sx={{
              backgroundColor: '#D9D9D9', // Color de fondo
              borderRadius: '8px', // Bordes redondeados
              '& .MuiInputBase-input': {
                color: '#606060', // Color del texto
              },
              '& .MuiInputLabel-root': {
                color: '#787878', // Color del label
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#787878', // Color del label al enfocar
              },
              '& .MuiFilledInput-root': {
                borderRadius: '8px', // Bordes redondeados del fondo
                backgroundColor: '#D9D9D9', // Color de fondo
              },
              '& .MuiFilledInput-root:before': {
                borderColor: '#303030', // Borde cuando el campo no está enfocado
              },
              '& .MuiFilledInput-root:hover:before': {
                borderColor: '#303030', // Borde cuando el campo está en hover
              },
              '& .MuiFilledInput-root:after': {
                borderColor: '#303030', // Color del borde al enfocar
              },
            }}
          />
        </Box>

      <List sx={{ textAlign: 'left', color: 'white' }}>
      {Array.isArray(beers) && beers.map(beer => (
        <ListItem key={beer.id} sx={{
          justifyContent: 'center',
          display: 'flex',
          color: 'white',
        }}>
          <ListItemText primary={beer.name} sx={{ textAlign: 'left', color: 'white' }} />
          <ListItemIcon edge="end">
            <ChevronRight sx={{ color: 'white', marginLeft: '22px' }} /> {}
          </ListItemIcon>
        </ListItem>
      ))}
      </List>

      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation sx={{ backgroundColor: '#303030', color: '#CFB523', borderTop: '2px solid #CFB523' }}>
          <BottomNavigationAction onClick={() => navigate('/bars')} label="Home" icon={<HomeIcon />} sx={{ color: '#E3E5AF' }} />
          <BottomNavigationAction onClick={() => navigate('/beers')} label="Search" icon={
            <Box
              component="img"
              src={SearchIcon}
              alt="Search"
              sx={{ width: 32, height: 26 }}
            />
          }/>
          <BottomNavigationAction onClick={() => navigate('/beers')} label="Map" icon={<MapIcon />} sx={{ color: '#E3E5AF' }} />
          <BottomNavigationAction onClick={() => navigate('/beers')} label="User" icon={<PersonIcon />} sx={{ color: '#E3E5AF' }} />
        </BottomNavigation>
      </Box>
    </Container>
  );
}

export default BeersIndex;
