import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../BarsEventsPhotoIndex.css';
import { Container, Button, Box, Typography, TextField, CircularProgress, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import main_icon from '../assets/icon_beercheers.png';
import HomeIcon from '../assets/baricon.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '../assets/searchgray.png';

const BarsEventsPhotoIndex = () => {
  const { barId, eventId } = useParams();
  const [photos, setPhotos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(`/api/api/v1/events/${eventId}/event_pictures`);
        
        if (response.data && response.data.data) {
          setPhotos(response.data.data);
        } else {
          console.warn('Unexpected response structure:', response.data);
          setPhotos([]);
        }
      } catch (error) {
        console.error('Error fetching event photos:', error);
        setPhotos([]);
      }
    };

    fetchPhotos();
  }, [eventId]);

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 0, pb: 12 }}>
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
      <div>
        <h2>Photos for this Event</h2>
        <div className="photo-gallery">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-item">
              <img
                src={photo.attributes.url}
                alt={photo.attributes.description || 'Event Photo'}
                className="event-photo"
              />
              <p>
              {photo.attributes.description || 'No description'}
            </p>
            </div>
          ))}
        </div>
      </div>

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

export default BarsEventsPhotoIndex;
