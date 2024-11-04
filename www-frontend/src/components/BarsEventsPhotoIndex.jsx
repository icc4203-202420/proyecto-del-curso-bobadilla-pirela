import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../BarsEventsPhotoIndex.css';
import { Container, Box, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/v1/events/${eventId}/event_pictures`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Photos data: ", response.data.data); // Log de depuración

        if (response.data.data && Array.isArray(response.data.data)) {
          const photoData = response.data.data;
          setPhotos(photoData.map(photo => ({
            id: photo.id,
            description: photo.attributes.description,
            url: photo.attributes.url,
            createdAt: photo.attributes.created_at,
            updatedAt: photo.attributes.updated_at,
            taggedUsers: photo.attributes.tagged_users, // Añade esta línea para obtener los usuarios etiquetados
          })));
        } else {
          console.warn('Unexpected response structure:', response.data.data);
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
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 900,
          fontSize: '50px',
          textShadow: '1px 3px 3px black',
          WebkitTextStroke: '1px black',
          MozTextStroke: '1px black',
        }}
      >
        Photos for this event
      </Typography>

      <div className="photo-gallery">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-item">
            <img
              src={photo.url}
              alt={photo.description || 'Event Photo'}
              className="event-photo"
            />
            <p style={{ fontFamily: 'Roboto, sans-serif' }}>{photo.description || 'No description'}</p>
            <div>
              {photo.taggedUsers && photo.taggedUsers.length > 0 ? (
                <p style={{ fontFamily: 'Roboto, sans-serif' }}>Tagged Users: <br/> <span style={{ color: '#303030' }}> {photo.taggedUsers.map(user => user.handle).join(', ')} </span> </p>
              ) : (
                <p style={{ fontFamily: 'Roboto, sans-serif' }}>No users tagged</p>
              )}
            </div>
          </div>
        ))}
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
          } />
          <BottomNavigationAction onClick={() => navigate('/bars-index-map')} label="Map" icon={<MapIcon />} sx={{ color: '#E3E5AF' }} />
          <BottomNavigationAction onClick={() => navigate('/search-users')} label="User" icon={<PersonIcon />} sx={{ color: '#E3E5AF' }} />
        </BottomNavigation>
      </Box>
    </Container>
  );
};

export default BarsEventsPhotoIndex;
