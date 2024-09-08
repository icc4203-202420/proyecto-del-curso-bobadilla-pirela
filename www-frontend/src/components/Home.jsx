import * as React from 'react';
import { Container, Box, TextField, Typography, Button, Link, IconButton, FormControl, InputAdornment } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo_beercheers.png';
import AddIcon from '@mui/icons-material/Add';

function Home() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('api/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            email: formData.email,
            password: formData.password,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.status.token);
        console.log('Token guardado:', data.status.token);
        navigate('/bars');
      } else {
        const errorData = await response.json();
        console.error('Error en el login:', errorData);
      }
    } catch (error) {
      console.error('Error en la conexión con el servidor:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 8,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={() => navigate('/bars')}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            margin: 1,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{ width: 200, height: 'auto', marginBottom: 2 }}
        />
        
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          <TextField
            id="filled-basic"
            name="email"
            variant="filled"
            required
            fullWidth
            label="Email"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
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
          
          <FormControl fullWidth variant="filled" sx={{ mt: 2 }}>
            <TextField
              id="filled-password-input"
              name="password"
              variant="filled"
              required
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Link href="" variant="body2" sx={{ color: 'white', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'right', width: '100%' }}>
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
                '& .MuiButton-startIcon': {
                  mr: 1,
                },
                minWidth: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Submit
            </Button>
          </Box>

          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 2 }}>
            OR
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
              type="button"
              onClick={() => navigate('/signup')}
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
                '& .MuiButton-startIcon': {
                  mr: 1,
                },
                minWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AddIcon sx={{ mr: 1 }} />
              SIGN UP FOR FREE
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
