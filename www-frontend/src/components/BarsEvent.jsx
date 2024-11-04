import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Snackbar, Alert, Button, List, ListItem, ListItemText, BottomNavigation, BottomNavigationAction, Typography as MuiTypography } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import main_icon from '../assets/icon_beercheers.png';
import HomeIcon from '../assets/baricon.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '../assets/searchgray.png';
import Menu from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { ChevronLeft, Cancel as CancelIcon } from '@mui/icons-material';

function BarsEvent() {
  const { barId, id } = useParams();
  const [event, setEvent] = useState(null);
  const [bar, setBar] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:3000/api/v1/users', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUserId(response.data.current_user.id);

          const attendanceResponse = await axios.get(`http://localhost:3000/api/v1/events/${id}/attendance`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsCheckedIn(attendanceResponse.data.checked_in);

        } catch (error) {
          console.error('Error fetching current user ID or attendance data', error);
        }
      }
    };

    fetchCurrentUserId();
  }, [id]);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchEventData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const eventResponse = await axios.get(`http://localhost:3000/api/v1/bars/${barId}/events/${id}`);
        const { event, bar } = eventResponse.data;
        setEvent(event);
        setBar(bar);

        const attendeesResponse = await axios.get(`http://localhost:3000/api/v1/events/${id}/attendees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Attendees:', attendeesResponse.data);
        setAttendees(attendeesResponse.data);
      } catch (error) {
        console.error('Error fetching event or bar data', error);
      }
    };

    fetchEventData();
  }, [id, barId, currentUserId]);

  const handleCheckIn = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.post(`http://localhost:3000/api/v1/events/${id}/attendance`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsCheckedIn(true);

      const response = await axios.get(`http://localhost:3000/api/v1/events/${id}/attendees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendees(response.data);

      setSnackbarMessage('You have confirmed your attendance.');
      setOpenSnackbar(true);
  
      setTimeout(() => {
        setOpenSnackbar(false);
      }, 3000);
    } catch (error) {
      console.error('Error checking in', error);
    }
  };

  const handleCancelAttendance = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/v1/events/${id}/attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsCheckedIn(false);

      // Update attendees list
      const response = await axios.get(`http://localhost:3000/api/v1/events/${id}/attendees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendees(response.data);
    } catch (error) {
      console.error('Error canceling attendance', error);
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 0, pb: 12 }}>
      <Box
        onClick={() => navigate(`/bars/${bar.id}/events`)}
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
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {event && (
        <>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              color: 'white',
              textAlign: 'center',
              mt: 2,
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 600,
              fontSize: '36px',
              textShadow: '1px 3px 3px black',
              WebkitTextStroke: '1px black',
              MozTextStroke: '1px black',
            }}
          >
            {event.name}
          </Typography>

          <Typography
            variant="body1"
            component="p"
            sx={{
              color: 'white',
              textAlign: 'center',
              mt: 1,
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
            }}
          >
            {event.description}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', width: '80%', pl: 5 }}>
            <Button
              type="button"
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: isCheckedIn ? 'grey' : '#CFB523',
                color: 'white',
                borderRadius: '5px',
                '&:hover': {
                  backgroundColor: isCheckedIn ? 'grey' : '#b89f3e',
                },
                fontSize: '1.25rem',
                minWidth: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={handleCheckIn}
              disabled={isCheckedIn}
            >
              {isCheckedIn ? 'CONFIRMED' : 'CHECK IN'}
            </Button>
            {isCheckedIn && (
              <Button
                type="button"
                sx={{
                  mt: 3,
                  mb: 2,
                  ml: 2,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#f44336',
                    color: 'white'
                  }
                }}
                onClick={handleCancelAttendance}
              >
                <CancelIcon />
              </Button>
            )}
          </Box>

          <Typography
            variant="body2"
            component="p"
            sx={{
              color: '#CFB523',
              textAlign: 'center',
              mt: 1,
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 300,
              fontSize: '18px',
            }}
          >
            Date: {new Date(event.date).toLocaleDateString()}
          </Typography>

          <Box
            sx={{
              display: 'flex-center',
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              mt: 2,
            }}
          >
            <Typography
              variant="body2"
              component="p"
              sx={{
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 300,
                fontSize: '18px',
                mx: 2,
              }}
            >
              Start date: {new Date(event.start_date).toLocaleDateString()}
            </Typography>
            <Typography
              variant="body2"
              component="p"
              sx={{
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 300,
                fontSize: '18px',
              }}
            >
              End date: {new Date(event.end_date).toLocaleDateString()}
            </Typography>
          </Box>

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
            Attendees
          </Typography>

          <List sx={{ color: 'white', mt: 2 }}>
            {attendees.map((user) => (
              <ListItem key={user.id} sx={{ bgcolor: '#333', mb: 1, borderRadius: '5px' }}>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                  secondary={
                    <Typography sx={{ color: user.is_friend ? 'lightgreen' : '#CFB523', }}>
                      @{user.handle} {user.is_friend && '(FRIEND)'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          
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
            Photos
          </Typography>

          <Box 
            mt={3} 
            textAlign="center" 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            flexDirection="row" // Cambiado a "row"
            sx={{ mb: 8 }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#CFB523',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#bfa11e',
                }
              }}
              onClick={() => navigate(`/bars/${bar.id}/events/${event.id}/photo`)}
            >
              <AddIcon sx={{ mr: 1 }} />
              ADD PHOTO
            </Button>
            
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#303030',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#606060',
                },
                ml: 2
              }}
              onClick={() => navigate(`/bars/${bar.id}/events/${event.id}/photo-index`)}
            >
              <Menu />
              ALL PHOTOS
            </Button>
          </Box>
        </>
      )}

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

export default BarsEvent;
