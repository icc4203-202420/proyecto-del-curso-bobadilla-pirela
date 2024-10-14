import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import Visibility from 'react-native-vector-icons/MaterialIcons';
import main_icon from '../assets/icon_beercheers.png';

const SignUp = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState([]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('api/api/v1/countries');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

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
      country_id: Yup.string(),
    }),
  });

  const handleSubmit = async (values) => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            handle: values.handle,
            password: values.password,
            password_confirmation: values.password_confirmation,
          },
        }),
      });

      if (response.ok) {
        router.push('/login');
      } else {
        console.error('Error creating user:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={main_icon} style={styles.logo} />

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
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/login')}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="First Name"
              onChangeText={handleChange('first_name')}
              value={values.first_name}
            />
            {touched.first_name && errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              onChangeText={handleChange('last_name')}
              value={values.last_name}
            />
            {touched.last_name && errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={handleChange('email')}
              value={values.email}
              keyboardType="email-address"
            />
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Age"
              onChangeText={handleChange('age')}
              value={values.age}
              keyboardType="numeric"
            />
            {touched.age && errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Handle"
              onChangeText={handleChange('handle')}
              value={values.handle}
            />
            {touched.handle && errors.handle && <Text style={styles.errorText}>{errors.handle}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Password"
              onChangeText={handleChange('password')}
              value={values.password}
              secureTextEntry={!showPassword}
            />
            {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TouchableOpacity onPress={handleClickShowPassword}>
              <Text style={styles.showPasswordText}>{showPassword ? 'Hide Password' : 'Show Password'}</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              onChangeText={handleChange('password_confirmation')}
              value={values.password_confirmation}
              secureTextEntry={!showPassword}
            />
            {touched.password_confirmation && errors.password_confirmation && (
              <Text style={styles.errorText}>{errors.password_confirmation}</Text>
            )}

            <Button title="Sign Up" onPress={handleSubmit} color="#CFB523" />
          </>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: '#606060',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  showPasswordText: {
    color: '#CFB523',
    textAlign: 'right',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFF',
  },
});

export default SignUp;
