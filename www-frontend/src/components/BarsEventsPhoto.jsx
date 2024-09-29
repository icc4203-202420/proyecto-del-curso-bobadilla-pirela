import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Button, Box, Typography, TextField, CircularProgress, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import main_icon from '../assets/icon_beercheers.png';
import HomeIcon from '../assets/baricon.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '../assets/searchgray.png';

const BarsEventsPhoto = () => {
  const { barId, eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { eventName } = location.state || {};
  const [picture, setPicture] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      setUserId(userId);
    } else {
      console.error('user_id is not found in localStorage');
    }
  }, []);

  const handleFileChange = (e) => {
    setPicture(e.target.files[0]);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('event_picture[picture]', picture);
    formData.append('event_picture[description]', description);
    formData.append('event_picture[event_id]', eventId);
    formData.append('event_picture[user_id]', userId);

    try {
      const response = await axios.post(`http://localhost:3000/api/api/v1/events/${eventId}/event_pictures`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      navigate(`/bars/${barId}/events/${eventId}`);
    } catch (error) {
      console.error('Error uploading picture:', error);
    } finally {
      setLoading(false);
    }
  };


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

        <Typography variant="h4"
          sx={{
            color: 'white',
            textAlign: 'center',
          }}
        >
          {eventName ? `${eventName}` : 'Add a Photo for this Event'}
        </Typography>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <label htmlFor="upload-input" style={{ cursor: 'pointer' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: picture ? '#F0F0F0' : '#FFDB01',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            {picture ? (
              <img
                src={URL.createObjectURL(picture)}
                alt="Selected"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            ) : (
              <span style={{ fontSize: '2.5rem', color: 'white' }}>+</span>
            )}
          </div>
          </label>
          <input
            id="upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <TextField
          fullWidth
          label="Description"
          variant="filled"
          multiline
          rows={4}
          value={description}
          onChange={handleDescriptionChange}
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            '& .MuiInputLabel-root': { color: '#606060' },
            '& .MuiInputBase-input': { color: '#303030' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#606060' },
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || !userId}
          sx={{
            backgroundColor: '#CFB523',
            color: 'white',
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
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Photo'}
        </Button>
      </form>

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

export default BarsEventsPhoto;