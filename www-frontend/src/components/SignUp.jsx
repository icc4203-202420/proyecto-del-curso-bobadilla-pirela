import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, MenuItem, Typography, Grid, IconButton, InputAdornment, FormControl } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import main_icon from '../assets/icon_beercheers.png';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const [countries, setCountries] = useState([]);

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required('First Name is required').min(2, 'First name has to have at least 2 characters'),
    last_name: Yup.string().required('Last Name is required').min(2, 'Last name has to have at least 2 characters'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    age: Yup.number().required('Age is required').min(18, 'You must be at least 18 years old'),
    handle: Yup.string().required('Handle is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    address_attributes: Yup.object().shape({
      line1: Yup.string(),
      line2: Yup.string(),
      city: Yup.string(),
      country_id: Yup.string().required('Country is required')
    }),
  });

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post('/api/api/v1/signup', {
        user: {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          handle: values.handle,
          password: values.password,
          password_confirmation: values.password_confirmation,
        },
      });

      if (response.status === 200) {
        navigate('/login');
      } else {
        console.error('Error creating user:', response.data);
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('api/api/v1/countries');
        setCountries(response.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  const textFieldStyle = {
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
        <Box component="img" src={main_icon} alt="Icon" sx={{ width: 100, height: 'auto', marginBottom: 1 }} />

        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            email: '',
            age: '',
            handle: '',
            password: '',
            password_confirmation: '',
            address_attributes: {
              line1: '',
              line2: '',
              city: '',
              country_id: '',
            },
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange }) => (
            <Form noValidate>
              <IconButton
                onClick={() => navigate('/login')}
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  margin: 1,
                  color: 'white',
                }}
              >
                <CloseIcon />
              </IconButton>

              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                <Typography variant="body2" sx={{ color: 'white', textAlign: 'center', mt: 1 }}>
                  About you
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Field
                    as={TextField}
                    label="First Name"
                    name="first_name"
                    required
                    fullWidth
                    variant="filled"
                    value={values.first_name}
                    onChange={handleChange}
                    sx={textFieldStyle}
                    helperText={<ErrorMessage name="first_name" component="span" />}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Field
                    as={TextField}
                    label="Last Name"
                    name="last_name"
                    required
                    fullWidth
                    variant="filled"
                    value={values.last_name}
                    onChange={handleChange}
                    sx={textFieldStyle}
                    helperText={<ErrorMessage name="last_name" component="span" />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label="Email"
                    name="email"
                    required
                    fullWidth
                    variant="filled"
                    value={values.email}
                    onChange={handleChange}
                    sx={textFieldStyle}
                    helperText={<ErrorMessage name="email" component="span" />}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Field
                    as={TextField}
                    label="Age"
                    name="age"
                    fullWidth
                    variant="filled"
                    value={values.age}
                    onChange={handleChange}
                    sx={textFieldStyle}
                    helperText={<ErrorMessage name="age" component="span" />}
                  />
                </Grid>
                <Grid item xs={8}>
                  <Field
                    as={TextField}
                    label="Handle"
                    name="handle"
                    required
                    fullWidth
                    variant="filled"
                    value={values.handle}
                    onChange={handleChange}
                    sx={textFieldStyle}
                    helperText={<ErrorMessage name="handle" component="span" />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label="Line 1 (Optional)"
                    name="address_attributes.line1"
                    fullWidth
                    variant="filled"
                    value={values.address_attributes.line1}
                    onChange={handleChange}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label="Line 2 (Optional)"
                    name="address_attributes.line2"
                    fullWidth
                    variant="filled"
                    value={values.address_attributes.line2}
                    onChange={handleChange}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Field
                    as={TextField}
                    label="City (Optional)"
                    name="address_attributes.city"
                    fullWidth
                    variant="filled"
                    value={values.address_attributes.city}
                    onChange={handleChange}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Field
                    as={TextField}
                    label="Country"
                    name="address_attributes.country_id"
                    fullWidth
                    required
                    variant="filled"
                    select
                    onChange={handleChange}
                    sx={textFieldStyle}
                    helperText={<ErrorMessage name="address_attributes.country_id" component="span" />}
                  >
                    <MenuItem value="">
                      <em>Select a country</em>
                    </MenuItem>
                    {countries.length > 0 && countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth variant="filled">
                    <Field
                      as={TextField}
                      label="Password"
                      name="password"
                      variant="filled"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={handleChange}
                      sx={textFieldStyle}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      helperText={<ErrorMessage name="password" component="span" />}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth variant="filled">
                    <Field
                      as={TextField}
                      label="Confirm Password"
                      name="password_confirmation"
                      variant="filled"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={values.password_confirmation}
                      onChange={handleChange}
                      sx={textFieldStyle}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      helperText={<ErrorMessage name="password_confirmation" component="span" />}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Button
                type="submit"
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
                <Typography variant="h6" sx={{ color: 'white'}}>
                  SIGN UP
                </Typography>
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
}

export default SignUp;
