import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Container, Box, Typography, Button, Grid, Slider, FormControl, FormLabel, FormHelperText, TextField } from '@mui/material';

const reviewSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, 'El puntaje debe ser al menos 1')
    .max(5, 'El puntaje debe ser máximo 5')
    .required('El puntaje es requerido'),
  text: Yup.string()
    .min(15, 'La reseña debe tener al menos 15 palabras')
    .required('La reseña es requerida'),
});

const BeersReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('token'); 
      await axios.post(`http://localhost:3000/api/api/v1/beers/${id}/reviews`, {
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

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, bgcolor: '#303030', p: 3, borderRadius: 3 }}>
        <Typography variant="h4" align="center" color="white" gutterBottom>
          Escribe una Reseña
        </Typography>

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
                    <FormLabel color="white">Puntaje (1-5)</FormLabel>
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
                      '& .MuiFilledInput-root:before': { borderColor: '#303030' },
                      '& .MuiFilledInput-root:hover:before': { borderColor: '#303030' },
                      '& .MuiFilledInput-root:after': { borderColor: '#303030' },
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
                      borderRadius: '50px',
                      '&:hover': { backgroundColor: '#b89f3e' },
                    }}
                  >
                    Submit Review
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>

        <Button
          onClick={() => navigate(`/beers/${id}`)}
          variant="outlined"
          sx={{
            mt: 2,
            color: 'white',
            borderColor: '#CFB523',
            '&:hover': {
              backgroundColor: '#CFB523',
              color: 'white',
            },
          }}
        >
          Back to Beer details
        </Button>
      </Box>
    </Container>
  );
};

export default BeersReview;
