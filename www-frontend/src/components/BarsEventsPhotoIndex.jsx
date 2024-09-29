import React, { useReducer, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Typography, Box, BottomNavigation, BottomNavigationAction, CircularProgress, Grid, Pagination } from '@mui/material';
import main_icon from '../assets/icon_beercheers.png';
import { ChevronLeft } from '@mui/icons-material';
import HomeIcon from '../assets/baricon.png';
import SearchIcon from '../assets/searchgray.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';

const BarsEventsPhotosIndex = () => {
  const { barId, eventId } = useParams();
  const [pictures, setPictures] = useState([]);
  const [event, setEvent] = useState(null);
  const [bar, setBar] = useState(null);
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:3000/api/api/v1/users', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUserId(response.data.current_user.id);
        } catch (error) {
          console.error('Error fetching current user ID', error);
        }
      }
    };

    fetchCurrentUserId();
  }, [eventId]);

  useEffect(() => {
    if (!currentUserId) return;
  
    const fetchEventData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
  
      try {
        const eventResponse = await axios.get(`http://localhost:3000/api/api/v1/bars/${barId}/events/${eventId}`);
        const { event, bar } = eventResponse.data;  // Verifica que event y bar existan en la respuesta
        setEvent(event);
        setBar(bar);
        console.log(eventResponse)
      } catch (error) {
        console.error('Error fetching event or bar data', error);
      }
    };
  
    fetchEventData();
  }, [eventId, barId, currentUserId]);

  
  useEffect(() => {
    if (!eventId) return;
    const fetchPictures = async () => {
      const response = await fetch(`http://localhost:3000/api/api/v1/bars/${barId}/events/${eventId}/photo-index`);
      const data = await response.json();
      if (response.ok) {
        setPictures(data.pictures);
      } else {
        console.error(data.error);
      }
    };
  
    fetchPictures();
  }, [eventId]);

  return (
    <Container component="main" maxWidth="md" sx={{ paddingBottom: 10 }}>
      <Box
        onClick={() => navigate(`/bars/${barId}/events/${eventId}`)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          mb: 1,
          cursor: 'pointer'
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
        Photos for {event ? event.name : 'Loading...'}
      </Typography>

      <Grid container spacing={2}>
      {pictures.map((picture) => (
        <Grid item xs={6} sm={4} md={3} key={picture.id}>
          <Card>
            <CardMedia
              component="img"
              height="140"
              image={picture.image_url}
              alt={`Picture by User ${picture.user_id}`}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Picture ID: {picture.id}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
      </Grid>

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
};

export default BarsEventsPhotosIndex;
