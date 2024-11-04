import React, { useEffect, useState } from 'react';
import { Container, Box, List, ListItem, ListItemText, ListItemIcon, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import main_icon from '../assets/icon_beercheers.png';
import HomeIcon from '../assets/baricon.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '../assets/searchgray.png';
import { ChevronRight, ChevronLeft } from '@mui/icons-material';

function BarsEventsIndex() {
  const { id } = useParams();
  const [bar, setBar] = useState(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/api/v1/bars/${id}/events`)
      .then(response => {
        //console.log(response.data);
        setBar(response.data || {});
        setEvents(response.data.events || []);
      })
      .catch(error => {
        console.error("No se pudieron capturar los datos del bar!", error);
      });
  }, [id]);

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 0, pb: 12 }}>
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

      {bar && (
        <Box sx={{ mb: 4 }}>
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
            {bar.name}
          </Typography>

          {bar.image_url && (
            <Box
              component="img"
              src={bar.image_url}
              alt="Bar"
              sx={{ width: '100%', height: 'auto', mb: 2 }}
            />
          )}

          <Typography
            variant="body1"
            component="p"
            sx={{ color: 'white', textAlign: 'center', mt: 4, mb:2}}
          >
            {bar.address?.line1 && <div><Typography variant="body1" sx={{ color: '#CFB523' }}>{bar.address.line1}</Typography></div>}
            {bar.address?.line2 && <div>{bar.address.line2}</div>}
            {bar.address?.city && <div>{bar.address.city}</div>}
            {bar.address?.country && <Typography variant="body1" sx={{ color: '#CFB523', fontWeight: 'bold' }}>{bar.address.country}</Typography>}
          </Typography>
        </Box>
      )}

      <Typography
        variant="h6"
        component="h3"
        maxWidth="100%"
        sx={{
          color: '#303030',
          backgroundColor: '#CFB523',
          textAlign: 'center',
          mt: 2,
          fontFamily: 'Roboto, sans-serif',
          fontSize: '30px',
          borderRadius: '8px',
          padding: '5px',
        }}
      >
        Events
      </Typography>


      <List sx={{ textAlign: 'left', color: 'white' }}>
        {events.length > 0 ? (
          events.map(event => (
            <ListItem key={event.id} sx={{ justifyContent: 'center', display: 'flex', color: 'white' }}>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ color: 'white' }}>{event.name}</Typography>
                    <Typography
                      sx={{
                        color: '#CFB523',
                        whiteSpace: 'nowrap',
                        ml: 3,
                      }}
                    >
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                  </Box>}
                sx={{ textAlign: 'left', color: 'white',}}
              />
              <ListItemIcon edge="end" onClick={() => navigate(`/bars/${bar.id}/events/${event.id}`)}>
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
          }/>
          <BottomNavigationAction onClick={() => navigate('/bars-index-map')} label="Map" icon={<MapIcon />} sx={{ color: '#E3E5AF' }} />
          <BottomNavigationAction onClick={() => navigate('/search-users')} label="User" icon={<PersonIcon />} sx={{ color: '#E3E5AF' }} />
        </BottomNavigation>
      </Box>
    </Container>
  );
}

export default BarsEventsIndex;
