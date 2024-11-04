import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Container, Box, Typography, Button, BottomNavigation, BottomNavigationAction, Grid, Slider, FormControl, FormLabel, FormHelperText, TextField, Alert } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import main_icon from '../assets/icon_beercheers.png';
import HomeIcon from '../assets/baricon_gray.png';
import SearchIcon from '../assets/searchyellow.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';

const reviewSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, 'El puntaje debe ser al menos 1')
    .max(5, 'El puntaje debe ser máximo 5')
    .required('El puntaje es requerido'),
  text: Yup.string()
    .test(
      'min-words',
      'La reseña debe tener al menos 15 palabras',
      function (value) {
        if (!value) return false;
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount >= 15;
      }
    )
    .required('La reseña es requerida'),
});

const BeersReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beerName, setBeerName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthError(true);
        setSubmitting(false);
        return;
      }
      
      await axios.post(`http://localhost:3000/api/v1/beers/${id}/reviews`, {
        review: {
          rating: values.rating,
          text: values.text,
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      resetForm();
      navigate(`/beers/${id}`);
    } catch (error) {
      console.error('Error submitting review:', error.response ? error.response.data : error.message);
    }
    setSubmitting(false);
  };

  useEffect(() => {
    axios.get(`http://localhost:3000/api/v1/beers/${id}`)
      .then(response => {
        console.log(response.data);
        setBeerName(response.data.name || "");
      })
      .catch(error => {
        console.error("No se pudo obtener el nombre del beer!", error);
      });
  }, [id]);

  return (
    <Container component="main" maxWidth="sm">
      <Box
        onClick={() => navigate(`/beers/${id}`)}
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

      <Typography variant="h4"
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
        {beerName}
      </Typography>

      <Box sx={{ mt: 4, bgcolor: '#303030', p: 3, borderRadius: 3 }}>
        {authError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Debes iniciar sesión para poder dejar una reseña.
          </Alert>
        )}
        
        <Typography variant="h4"
          sx={{
            color: 'white',
            textAlign: 'center',
          }}
        >
          Write your opinion!
        </Typography>

        {isAuthenticated ? (
          <Formik
            initialValues={{ rating: 1, text: '' }}
            validationSchema={reviewSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, errors, touched, setFieldValue, handleBlur }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <FormLabel color="white" sx={{color:'white', mt:4}}>Puntaje (1-5)</FormLabel>
                      <Slider
                        value={values.rating}
                        min={1}
                        max={5}
                        step={1}
                        onChange={(e, value) => setFieldValue('rating', value)}
                        onBlur={handleBlur}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}`}
                        sx={{
                          color: '#CFB523',
                          '& .MuiSlider-thumb': { backgroundColor: '#CFB523' },
                          '& .MuiSlider-track': { backgroundColor: '#CFB523' },
                          '& .MuiSlider-rail': { backgroundColor: '#D9D9D9' },
                        }}
                      />
                      {touched.rating && errors.rating && (
                        <FormHelperText error>{errors.rating}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="text"
                      name="text"
                      label="Reseña"
                      variant="filled"
                      multiline
                      rows={4}
                      value={values.text}
                      onChange={(e) => setFieldValue('text', e.target.value)}
                      onBlur={handleBlur}
                      error={touched.text && Boolean(errors.text)}
                      helperText={touched.text && errors.text}
                      sx={{
                        backgroundColor: '#D9D9D9',
                        borderRadius: '8px',
                        '& .MuiInputLabel-root': { color: '#606060' },
                        '& .MuiInputBase-input': { color: '#303030' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isSubmitting}
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
                      Submit Review
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        ) : (
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: '#CFB523',
              color: 'white',
              borderRadius: '50px',
              '&:hover': { backgroundColor: '#b89f3e' },
            }}
          >
            Login
          </Button>
        )}
      </Box>

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

export default BeersReview;
