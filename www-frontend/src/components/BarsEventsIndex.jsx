import React, { useEffect, useState } from 'react';
import { Container, Box, List, ListItem, ListItemText, ListItemIcon, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import main_icon from '../assets/icon_beercheers.png';
import HomeIcon from '../assets/baricon.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '../assets/searchgray.png';
import { ChevronRight ,ChevronLeft } from '@mui/icons-material';

function BarsEventsIndex() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [barName, setBarName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/api/api/v1/bars/${id}/events`)
      .then(response => {
        console.log(response.data);
        setEvents(response.data.events || []);
        setBarName(response.data.bar.name || "");
      })
      .catch(error => {
        console.error("No se pudieron capturar los eventos!", error);
      });
  }, [id]);

  return (
    <Container component="main" maxWidth="md">
      <Box
        onClick={() => navigate('/bars')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          mb: 1,
        }}
      >
        <ChevronLeft sx={{ color: 'white' }} />
      </Box>

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
        {barName}
      </Typography>

      <List sx={{ textAlign: 'left', color: 'white' }}>
        {events.length > 0 ? (
          events.map(event => (
            <ListItem key={event.id} sx={{ justifyContent: 'center', display: 'flex', color: 'white' }}>
              <ListItemText primary={event.name} sx={{ textAlign: 'left', color: 'white' }}/>
                <ListItemIcon edge="end">
                  <ChevronRight sx={{ color: 'white', marginLeft: '22px' }} />
                </ListItemIcon>
            </ListItem>
          ))
        ) : (
          <Typography sx={{ textAlign: 'center', color: 'white' }}>No events available</Typography>
        )}
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
          <BottomNavigationAction onClick={() => navigate('/bars')} label="Map" icon={<MapIcon />} sx={{ color: '#E3E5AF' }} />
          <BottomNavigationAction onClick={() => navigate('/search-users')} label="User" icon={<PersonIcon />} sx={{ color: '#E3E5AF' }} />
        </BottomNavigation>
      </Box>
    </Container>
  );
}

export default BarsEventsIndex;
