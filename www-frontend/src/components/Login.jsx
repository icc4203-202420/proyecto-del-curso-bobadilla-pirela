import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Container, Box, TextField, Typography, Button, Link, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import logo from '../assets/logo_beercheers.png';

const validationSchema = Yup.object({
  email: Yup.string().email('Email no válido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const initialValues = {
  email: '',
  password: '',
};

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post('api/api/v1/login', {
        user: {
          email: values.email,
          password: values.password,
        },
      });
      
      if (response.status === 200) {
        const { token } = response.data.status;
        localStorage.setItem('token', token);
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setServerError('Correo electrónico o contraseña incorrectos.');
      } else {
        setServerError('Error en el servidor. Intenta nuevamente más tarde.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, position: 'relative' }}>
        <IconButton
          onClick={() => navigate('/')}
          sx={{ position: 'absolute', top: 0, right: 0, margin: 1, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box component="img" src={logo} alt="Logo" sx={{ width: 200, height: 'auto', marginBottom: 2 }} />
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form noValidate>
              <Field
                as={TextField}
                name="email"
                variant="filled"
                required
                fullWidth
                label="Email"
                autoComplete="email"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                sx={{
                  backgroundColor: '#D9D9D9',
                  borderRadius: '8px',
                  '& .MuiInputBase-input': { color: '#606060' },
                  '& .MuiInputLabel-root': { color: '#787878' },
                  '& .MuiFilledInput-root:before': { borderColor: '#303030' },
                  '& .MuiFilledInput-root:hover:before': { borderColor: '#303030' },
                  '& .MuiFilledInput-root:after': { borderColor: '#303030' },
                }}
              />

              <Field
                as={TextField}
                name="password"
                variant="filled"
                required
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
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
                  mt: 2,
                  '& .MuiInputBase-input': { color: '#606060' },
                  '& .MuiFilledInput-root:before': { borderColor: '#303030' },
                  '& .MuiFilledInput-root:hover:before': { borderColor: '#303030' },
                  '& .MuiFilledInput-root:after': { borderColor: '#303030' },
                  '& .MuiInputLabel-root': { color: '#787878' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#787878' },
                  '& .MuiFilledInput-root': { borderRadius: '8px', backgroundColor: '#D9D9D9', },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Link href="#" variant="body2" sx={{ color: 'white', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3, mb: 2, backgroundColor: '#CFB523', color: 'white',
                    width: 175,
                    fontSize: 26,
                    borderRadius: '50px',
                    '&:hover': { backgroundColor: '#b89f3e' },
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'LOG IN'}
                </Button>
              </Box>

              {serverError && (
                <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
                  {serverError}
                </Typography>
              )}

              <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 2 }}>
                OR
              </Typography>

              <Button
                type="button"
                onClick={() => navigate('/signup')}
                variant="contained"
                sx={{
                  mt: 3, mb: 2, backgroundColor: '#CFB523', color: 'white',
                  borderRadius: '50px',
                  fontsize: 26,
                  height: 50,
                  '&:hover': { backgroundColor: '#b89f3e' },
                  textAlign: 'center',
                }}
              >
                <AddIcon sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'white'}}>
                  SIGN UP FOR FREE
                </Typography>
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
}

export default Login;
