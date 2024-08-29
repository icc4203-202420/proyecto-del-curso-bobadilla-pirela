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

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
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
          sx={{ mt: 1 }}
        >
          <TextField
            id="filled-basic"
            variant="filled"
            required
            fullWidth
            label="Handle or Email"
            autoComplete="email"
            sx={{
              backgroundColor: '#D9D9D9', // Color de fondo
              borderRadius: '8px', // Bordes redondeados
              '& .MuiInputBase-input': {
                color: '#606060', // Color del texto
              },
              '& .MuiInputLabel-root': {
                color: '#787878', // Color del label
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#787878', // Color del label al enfocar
              },
              '& .MuiFilledInput-root': {
                borderRadius: '8px', // Bordes redondeados del fondo
                backgroundColor: '#D9D9D9', // Color de fondo
              },
              '& .MuiFilledInput-root:before': {
                borderColor: '#303030', // Borde cuando el campo no está enfocado
              },
              '& .MuiFilledInput-root:hover:before': {
                borderColor: '#303030', // Borde cuando el campo está en hover
              },
              '& .MuiFilledInput-root:after': {
                borderColor: '#303030', // Color del borde al enfocar
              },
            }}
          />
          
          <FormControl fullWidth variant="filled" sx={{ mt: 2 }}>
            <TextField
              id="filled-password-input"
              variant="filled"
              required
              type={showPassword ? 'text' : 'password'}
              label="Password"
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
                backgroundColor: '#D9D9D9', // Color de fondo
                borderRadius: '8px', // Bordes redondeados
                '& .MuiInputBase-input': {
                  color: '#606060', // Color del texto
                },
                '& .MuiInputLabel-root': {
                  color: '#787878', // Color del label
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#787878', // Color del label al enfocar
                },
                '& .MuiFilledInput-root': {
                  borderRadius: '8px', // Bordes redondeados del fondo
                  backgroundColor: '#D9D9D9', // Color de fondo
                },
                '& .MuiFilledInput-root:before': {
                borderColor: '#303030', // Borde cuando el campo no está enfocado
                },
                '& .MuiFilledInput-root:hover:before': {
                  borderColor: '#303030', // Borde cuando el campo está en hover
                },
                '& .MuiFilledInput-root:after': {
                  borderColor: '#303030', // Color del borde al enfocar
                },
              }}
            />
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Link href="" variant="body2" sx={{ color: 'white', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </Box>
          
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 2 }}>
            OR
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: '#CFB523', // Color de fondo del botón
                color: 'white', // Color del texto
                borderRadius: '50px', // Bordes muy redondeados
                '&:hover': {
                  backgroundColor: '#b89f3e', // Color de fondo en hover (opcional)
                },
                fontSize: '1.25rem', // Texto más grande
                '& .MuiButton-startIcon': {
                  mr: 1,
                },
                minWidth: '200px', // Menos ancho
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AddIcon sx={{ mr: 1 }} /> {/* Ícono de "+" */}
              SIGN UP FOR FREE
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
