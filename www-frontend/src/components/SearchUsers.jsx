import React, { useReducer, useState, useEffect } from 'react';
import { Container, Typography, Box, MenuItem, TextField, Button, List, ListItem, ListItemText, CircularProgress, IconButton, BottomNavigation, BottomNavigationAction, Autocomplete } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import main_icon from '../assets/icon_beercheers.png';
import HomeIcon from '../assets/baricon_gray.png';
import SearchIcon from '../assets/searchgray.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

const initialState = {
  users: [],
  loading: true,
  error: null,
  searchTerm: '',
  currentUserId: null,
  friendships: {}
};

const actions = {
  SET_USERS: 'SET_USERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_CURRENT_USER_ID: 'SET_CURRENT_USER_ID',
  SET_FRIENDSHIPS: 'SET_FRIENDSHIPS',
  ADD_FRIENDSHIP: 'ADD_FRIENDSHIP',
  REMOVE_FRIENDSHIP: 'REMOVE_FRIENDSHIP'
};

const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_USERS:
      return { ...state, users: action.payload, loading: false };
    case actions.SET_LOADING:
      return { ...state, loading: true };
    case actions.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case actions.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
    case actions.SET_CURRENT_USER_ID:
      return { ...state, currentUserId: action.payload };
    case actions.SET_FRIENDSHIPS:
      const friendships = action.payload.reduce((acc, friendship) => {
        acc[friendship.friend.id] = true;
        return acc;
      }, {});
      return { ...state, friendships };
    case actions.ADD_FRIENDSHIP:
      return { ...state, friendships: { ...state.friendships, [action.payload]: true } };
    case actions.REMOVE_FRIENDSHIP:
      const updatedFriendships = { ...state.friendships };
      delete updatedFriendships[action.payload];
      return { ...state, friendships: updatedFriendships };
    default:
      return state;
  }
};

const SearchUsers = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const [bars, setBars] = useState([]);
  const [selectedBar, setSelectedBar] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      dispatch({ type: actions.SET_LOADING });

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.current_user && response.data.users) {
          const loggedInUserId = response.data.current_user.id;
          const allUsers = response.data.users;
          const filteredUsers = allUsers.filter(user => user.id !== loggedInUserId);

          dispatch({ type: actions.SET_USERS, payload: filteredUsers });
          dispatch({ type: actions.SET_CURRENT_USER_ID, payload: loggedInUserId });
          
          const friendshipsResponse = await axios.get(`http://localhost:3000/api/v1/users/${loggedInUserId}/friendships`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          dispatch({ type: actions.SET_FRIENDSHIPS, payload: friendshipsResponse.data });
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        dispatch({ type: actions.SET_ERROR, payload: error.message });
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/bars')
      .then(response => {
        setBars(response.data.bars || []);
      })
      .catch(error => {
        console.error("No se pudieron capturar los bars!", error);
      });
  }, []);

  const handleSearchChange = (event) => {
    dispatch({ type: actions.SET_SEARCH_TERM, payload: event.target.value });
  };

  const handleAddFriend = async (userId) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/users/${state.currentUserId}/friendships`,
        { friendship: { friend_id: userId, bar_id: selectedBar ? selectedBar.id : null } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({ type: actions.ADD_FRIENDSHIP, payload: userId });
    } catch (error) {
      console.error('Error al añadir amigo:', error);
    }
  };

  const handleRemoveFriend = async (userId) => {
    const token = localStorage.getItem('token');
    
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/users/${state.currentUserId}/friendships/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({ type: actions.REMOVE_FRIENDSHIP, payload: userId });
    } catch (error) {
      console.error('Error al eliminar amigo:', error);
    }
  };

  const filteredUsers = state.users.filter(user =>
    user.handle.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return <Typography variant="h6">Error: {state.error}</Typography>;
  }
  return (
    <Container component="main" maxWidth="md" sx={{ mt: 0, pb: 12 }}>
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

      <Box component="form" noValidate sx={{ mt: 4 }}>
        <TextField
          id="handle-search"
          variant="filled"
          fullWidth
          label="Handle"
          value={state.searchTerm}
          onChange={handleSearchChange}
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
        <Autocomplete
          options={bars}
          getOptionLabel={(option) => option.name}
          onChange={(event, newValue) => {
            setSelectedBar(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select the bar where you met"
              variant="filled"
              fullWidth
              sx={{
                mt: 2,
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
          )}
        />
      </Box>

      <List sx={{ textAlign: 'left', color: 'white', mt: 2 }}>
        {filteredUsers.map(user => (
          <ListItem
            key={user.id}
            sx={{
              justifyContent: 'center',
              display: 'flex',
              color: 'white',
              backgroundColor: '#303030',
              mb: 1,
              alignItems: 'center'
            }}
          >
            <ListItemText primary={user.handle} sx={{ textAlign: 'left', color: 'white' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'end', width: '80%' }}>
              {state.friendships[user.id] ? (
                <>
                  <Typography variant="body1" sx={{ color: 'grey', mr: 2 }}>
                    ADDED
                  </Typography>
                  <IconButton
                    edge="end"
                    color="inherit"
                    onClick={() => handleRemoveFriend(user.id)}
                    sx={{ color: 'red' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'end', width: '100%' }}>
                  <Button
                    type="button"
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
                      minWidth: '150px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={() => handleAddFriend(user.id)}
                  >
                    ADD FRIEND
                  </Button>
                </Box>
              )}
            </Box>
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
          }/>
          <BottomNavigationAction onClick={() => navigate('/bars-index-map')} label="Map" icon={<MapIcon />} sx={{ color: '#E3E5AF' }} />
          <BottomNavigationAction onClick={() => navigate('/search-users')} label="User" icon={<PersonIcon />} sx={{ color: '#CFB523' }} />
        </BottomNavigation>
      </Box>
    </Container>
  );
};

export default SearchUsers;
