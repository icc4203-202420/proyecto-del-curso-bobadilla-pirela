import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { Slider } from '@rneui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';

const reviewSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, 'El puntaje debe ser al menos 1')
    .max(5, 'El puntaje debe ser máximo 5')
    .required('El puntaje es requerido'),
  text: Yup.string()
    .test(
      'min-words',
      'La reseña debe tener al menos 15 palabras',
      (value) => {
        if (!value) return false;
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount >= 15;
      }
    )
    .required('La reseña es requerida'),
});

const BeersReview = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const [beerName, setBeerName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('login');
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, [navigation]);

  useEffect(() => {
    const fetchBeerName = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/beers/${id}`);
        const data = await response.json();
        setBeerName(data.name || "");
      } catch (error) {
        console.error("No se pudo obtener el nombre de la cerveza!", error);
      }
    };
    fetchBeerName();
  }, [id]);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/v1/beers/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          review: {
            rating: values.rating,
            text: values.text,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la reseña');
      }

      resetForm();
      navigation.navigate(`BeersDetail`, { id });
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la reseña. Inténtalo de nuevo.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>

      <Text style={styles.title}>{beerName}</Text>

      {isAuthenticated ? (
        <Formik
          initialValues={{ rating: 1, text: '' }}
          validationSchema={reviewSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
            <>
              <Text style={styles.label}>Puntaje (1-5): {values.rating}</Text>
              <Slider
                value={values.rating}
                onValueChange={(value) => setFieldValue('rating', value)}
                maximumValue={5}
                minimumValue={1}
                step={0.1}
                allowTouchTrack
                trackStyle={styles.trackStyle}
                thumbStyle={styles.thumbStyle}
              />
              {touched.rating && errors.rating && (
                <Text style={styles.errorText}>{errors.rating}</Text>
              )}

              <Text style={styles.label}>Reseña:</Text>
              <TextInput
                style={styles.textInput}
                multiline
                onChangeText={handleChange('text')}
                onBlur={handleBlur('text')}
                value={values.text}
                placeholder="Escribe tu reseña aquí"
                placeholderTextColor="#606060"
              />
              {touched.text && errors.text && (
                <Text style={styles.errorText}>{errors.text}</Text>
              )}

              <Pressable onPress={handleSubmit} style={styles.button}>
                <Text style={styles.buttonText}>Enviar Reseña</Text>
              </Pressable>
            </>
          )}
        </Formik>
      ) : (
        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </Pressable>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#303030',
  },
  backButton: {
    backgroundColor: '#CFB523',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
  label: {
    color: 'white',
    marginBottom: 8,
  },
  textInput: {
    height: 100,
    borderColor: '#CFB523',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    color: 'white',
    backgroundColor: '#D9D9D9',
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  trackStyle: {
    height: 5,
    backgroundColor: '#D9D9D9',
  },
  thumbStyle: {
    height: 20,
    width: 20,
    backgroundColor: '#CFB523',
  },
  button: {
    backgroundColor: '#CFB523',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BeersReview;
