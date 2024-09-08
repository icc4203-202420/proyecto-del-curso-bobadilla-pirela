import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, List, ListItem, ListItemText, Typography, Button } from '@mui/material';
import axios from 'axios';
import main_icon from '../assets/icon_beercheers.png';
import HomeButton from './HomeButton';

function SearchUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/api/v1/users')
      .then(response => {
        setUsers(response.data.users || []);
      })
      .catch(error => {
        console.error("No se pudieron capturar los usuarios!", error);
      });
  }, []);

  const filteredUsers = users.filter(user =>
    user.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container component="main" maxWidth="md">
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        {filteredUsers.map(user => (
          <ListItem key={user.id} sx={{
            justifyContent: 'center',
            display: 'flex',
            color: 'white',
          }}>
            <ListItemText primary={user.handle} sx={{ textAlign: 'left', color: 'white' }} />
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
    </Container>
  );
}

export default SearchUsers;
