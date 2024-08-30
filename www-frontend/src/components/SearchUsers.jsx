import React, { useState } from 'react';
import { Container, Box, TextField, List, ListItem, ListItemText, Typography, BottomNavigation, BottomNavigationAction, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import main_icon from '../assets/icon_beercheers.png';
import HomeIcon from '../assets/baricon_gray.png';
import SearchIcon from '../assets/searchgray.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import HomeButton from './HomeButton';

function SearchUsers() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="md">
      <HomeButton />
      
      <Box
        component="img"
        src={main_icon}
        alt="Icon"
        sx={{ width: 100, height: 'auto', marginBottom: 2, marginTop: 2 }}
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
        Find a<br />
        friend please
      </Typography>

      <Box
        component="form"
        noValidate
        sx={{ mt: 4 }}
      >
        <TextField
          id="handle-search"
          variant="filled"
          fullWidth
          label="Handle"
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

      <List sx={{ textAlign: 'left', color: 'white', mt: 2 }}>
        {users.map(user => (
          <ListItem key={user.id} sx={{
            justifyContent: 'center',
            display: 'flex',
            color: 'white',
          }}>
            <ListItemText primary={user.handle} sx={{ textAlign: 'left', color: 'white' }} />
          </ListItem>
        ))}
      </List>

      <Typography
        variant="h6"
        component="h2"
        sx={{
          color: 'white',
          textAlign: 'left',
          mt: 4,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 700,
          fontSize: '18px',
          textShadow: '1px 1px 2px black',
        }}
      >
        Event where you met
      </Typography>

      <Box
        component="form"
        noValidate
        sx={{ mt: 2 }}
      >
        <TextField
          id="bar-search"
          variant="filled"
          fullWidth
          label="Bar name (optional)"
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

      <List sx={{ textAlign: 'left', color: 'white', mt: 2 }}>
        {events.map(event => (
          <ListItem key={event.id} sx={{
            justifyContent: 'center',
            display: 'flex',
            color: 'white',
          }}>
            <ListItemText primary={event.name} sx={{ textAlign: 'left', color: 'white' }} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Button
            type="submit"
            variant="contained"
            sx={{
            mt: 3,
            mb: 2,
            backgroundColor: '#CFB523',
            color: 'white',
            borderRadius: '50px',
            '&:hover': {
                backgroundColor: '#b89f3e',
            },
            fontSize: '1.25rem',
            minWidth: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
            }}
        >
            ADD FRIEND
        </Button>
      </Box>


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
    </Container>
  );
}

export default SearchUsers;
