import React, { useState, useEffect, useReducer } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Button, Box, Typography, TextField, Autocomplete, CircularProgress, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import main_icon from '../assets/icon_beercheers.png';
import HomeIcon from '../assets/baricon.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '../assets/searchgray.png';

const initialState = {
  users: [],
  currentUserId: null,
  loading: false,
  error: null,
};

const actions = {
  SET_LOADING: 'SET_LOADING',
  SET_USERS: 'SET_USERS',
  SET_CURRENT_USER_ID: 'SET_CURRENT_USER_ID',
  SET_ERROR: 'SET_ERROR',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_LOADING:
      return { ...state, loading: true };
    case actions.SET_USERS:
      return { ...state, users: action.payload, loading: false };
    case actions.SET_CURRENT_USER_ID:
      return { ...state, currentUserId: action.payload };
    case actions.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const BarsEventsPhoto = () => {
  const { barId, eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { eventName } = location.state || {};
  const [picture, setPicture] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]); // Estado para usuarios seleccionados
  const [state, dispatch] = useReducer(reducer, initialState); // Usar el reducer


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Carga los usuarios al montar el componente
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
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        dispatch({ type: actions.SET_ERROR, payload: error.message });
      }
    };

    fetchUsers();
  }, []);

  const handleFileChange = (e) => {
    setPicture(e.target.files[0]);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!state.currentUserId || selectedUsers.length === 0) { // Verifica que haya usuarios seleccionados
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('event_picture[picture]', picture);
    formData.append('event_picture[description]', description);
    formData.append('event_picture[event_id]', eventId);
    
    // Agrega los IDs de los usuarios seleccionados
    selectedUsers.forEach(user => {
      formData.append('event_picture[user_ids][]', user.id); // Se asume que el backend acepta un arreglo de IDs de usuario
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/api/v1/events/${eventId}/event_pictures`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
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

  const handleAddUser = () => {
    if (selectedUser && !selectedUsers.some(user => user.id === selectedUser.id)) {
      setSelectedUsers([...selectedUsers, selectedUser]);
      setSelectedUser(null); // Limpia la selección actual
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
        
      <Box
        component="img"
        src={main_icon}
        alt="Icon"
        sx={{ width: 100, height: 'auto', marginBottom: 1 }}
      />

      <Typography variant="h4"
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
        {eventName ? `${eventName}` : 'Add a Photo for this Event'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <label htmlFor="upload-input" style={{ cursor: 'pointer' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: picture ? '#CFB523' : '#CFB523',
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
              <span style={{ fontSize: '2.5rem', color: 'black' }}>+</span>
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

        <div style={{ marginBottom: '20px', width: '100%', alignItems: 'center' }}>
          <Autocomplete
            options={state.users}
            getOptionLabel={(option) => option.handle}
            value={selectedUser}
            onChange={(event, newValue) => {
              setSelectedUser(newValue); // Actualiza el usuario seleccionado
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Users by Handle"
                variant="filled"
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  marginLeft: '18px',
                  width: '80%', // Establece el ancho al 60%
                  float: 'left',
                  mt: 2,
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
          <Button
            variant="contained"
            onClick={handleAddUser} // Maneja la selección de usuarios
            sx={{
              marginLeft: '12px',
              mt: 3.2,
              backgroundColor: '#CFB523',
              width: '30px', // Establece el ancho al 30%
              height: '100%', // Asegúrate de que la altura del botón sea igual al TextField
              float: 'center', // Flota a la derecha
              '&:hover': {
                backgroundColor: '#B9A21C',
              },
            }}
          >
            +
          </Button>
          <div style={{ clear: 'both' }} /> {/* Asegura que los elementos floten correctamente */}
        </div>

        {/* Mostrar usuarios seleccionados */}
        {selectedUsers.length > 0 && (
          <Box sx={{ marginBottom: '20px' }}>
            <Typography variant="h6">Selected Users:</Typography>
            {selectedUsers.map(user => (
              <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#606060', marginBottom: '5px' }}>
                <Typography>{user.handle}</Typography>
                <Button
                  onClick={() => {
                    // Elimina el usuario de la selección
                    setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
                  }}
                  sx={{
                    color: 'red', // Cambia el color del texto del botón
                    minWidth: '30px', // Establece un ancho mínimo para el botón
                    padding: 0, // Elimina el padding
                  }}
                >
                  X
                </Button>
              </Box>
            ))}
          </Box>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#CFB523',
            '&:hover': {
              backgroundColor: '#B9A21C',
            },
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit photo'}
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