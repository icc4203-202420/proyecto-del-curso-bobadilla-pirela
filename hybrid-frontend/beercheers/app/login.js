import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';

const validationSchema = Yup.object({
  email: Yup.string().email('Email no válido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const initialValues = {
  email: '',
  password: '',
};

export default function Login() {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token && isMounted.current) {
        router.push('/');
      }
    };

    checkToken();
    
    return () => {
      isMounted.current = false;
    };
  }, [router]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            email: values.email,
            password: values.password,
          }
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor.');
      }
  
      const data = await response.json();
      if (data.status && data.status.token) {
        await AsyncStorage.setItem('token', data.status.token);
        await AsyncStorage.setItem('user_id', `${data.status.data.user.id}`);
        router.push('/');
      } else {
        setServerError('Token no recibido. Por favor intenta nuevamente.');
      }
  
    } catch (error) {
      console.log('Error en la solicitud:', error);
      setServerError('Error de conexión.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo_beercheers.png')} style={styles.logo} />
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={handleChange('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Password"
              onChangeText={handleChange('password')}
              value={values.password}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'} Password</Text>
            </TouchableOpacity>

            <Button onPress={handleSubmit} title={isSubmitting ? 'Sending...' : 'Log In'} color="#CFB523" />

            {serverError && <Text style={styles.errorText}>{serverError}</Text>}

            <Text style={styles.orText}>OR</Text>

            <Button onPress={() => router.push('/signup')} title="Sign Up for Free" color="#CFB523" />
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#D9D9D9',
    color: '#606060',
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
  },
  showPasswordText: {
    color: '#CFB523',
    textAlign: 'right',
    marginBottom: 20,
  },
  orText: {
    color: 'white',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
});
