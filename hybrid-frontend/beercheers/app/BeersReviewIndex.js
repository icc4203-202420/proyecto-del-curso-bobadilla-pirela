import React, { useReducer, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Image, Alert } from 'react-native';
import { Rating } from 'react-native-ratings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '@env';

const initialState = {
  reviews: [],
  loading: true,
  error: null,
  userReview: null,
  beerName: '',
};

const actions = {
  SET_REVIEWS: 'SET_REVIEWS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER_REVIEW: 'SET_USER_REVIEW',
  SET_BEER_NAME: 'SET_BEER_NAME',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_REVIEWS:
      return { ...state, reviews: action.payload, loading: false };
    case actions.SET_LOADING:
      return { ...state, loading: true };
    case actions.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case actions.SET_USER_REVIEW:
      return { ...state, userReview: action.payload };
    case actions.SET_BEER_NAME:
      return { ...state, beerName: action.payload };
    default:
      return state;
  }
};

const BeersReviewIndex = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('login'); // Redirigir al login si no está autenticado
      } else {
        setIsAuthenticated(true);
        fetchReviews(token); // Solo buscar reseñas si el usuario está autenticado
      }
    };
    checkAuth();
  }, [navigation]);

  const fetchReviews = async (token) => {
    dispatch({ type: actions.SET_LOADING });

    try {
      const beerResponse = await fetch(`${BACKEND_URL}/api/v1/beers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const beerData = await beerResponse.json();

      const userReview = beerData.user_review || null;
      if (userReview) {
        dispatch({ type: actions.SET_USER_REVIEW, payload: userReview });
      }

      dispatch({ type: actions.SET_BEER_NAME, payload: beerData.name });

      const reviewsResponse = await fetch(`${BACKEND_URL}/api/v1/beers/${id}/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const reviewsData = await reviewsResponse.json();
      
      dispatch({ type: actions.SET_REVIEWS, payload: reviewsData.reviews });
    } catch (error) {
      dispatch({ type: actions.SET_ERROR, payload: error.message });
    }
  };

  if (state.loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#CFB523" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (state.error) {
    return <Text style={styles.errorText}>Error: {state.error}</Text>;
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Debes iniciar sesión para ver las reseñas.</Text>
        <Pressable onPress={() => navigation.navigate('login')} style={styles.button}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </Pressable>
      </View>
    );
  }

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <Rating
        startingValue={item.rating}
        readonly
        imageSize={20}
        style={styles.rating}
      />
      <Text style={styles.reviewText}>{item.text}</Text>
      <Text style={styles.userInfo}>
        <strong>By:</strong> {item.user.handle} on {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      
      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />
      
      <Text style={styles.beerName}>{state.beerName}</Text>

      {state.userReview && (
        <View style={styles.reviewCard}>
          <Text style={styles.userReviewTitle}>Your Review:</Text>
          <Rating
            startingValue={state.userReview.rating}
            readonly
            imageSize={20}
            style={styles.rating}
          />
          <Text style={styles.reviewText}>{state.userReview.text}</Text>
        </View>
      )}

      <FlatList
        data={state.reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id.toString()}
        initialNumToRender={5}
        contentContainerStyle={styles.reviewList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  icon: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  beerName: {
    color: '#FFFFFF',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#303030',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  reviewCard: {
    backgroundColor: '#404040',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  userReviewTitle: {
    color: '#CFB523',
    fontSize: 18,
    marginBottom: 8,
  },
  reviewText: {
    color: 'white',
    marginVertical: 4,
  },
  userInfo: {
    color: '#CFB523',
    fontSize: 14,
  },
  reviewList: {
    paddingBottom: 16,
  },
  button: {
    backgroundColor: '#CFB523',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BeersReviewIndex;
