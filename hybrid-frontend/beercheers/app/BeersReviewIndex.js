import React, { useReducer, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Pressable, Image, Alert } from 'react-native';
import { Rating } from 'react-native-ratings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@env';
import { MaterialIcons } from '@expo/vector-icons'; 

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
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = route.params;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
  
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };

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
        tintColor={"#404040"}
      />
      <Text style={styles.reviewText}>{item.text}</Text>
      <Text style={styles.userInfo}>
        By: <Text style={{ fontWeight: 'bold' }}>{item.user.handle}</Text> on {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      
      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={isLoggedIn ? handleLogout : handleLogin}
      >
        <Text style={styles.logoutButtonText}>{isLoggedIn ? 'Home' : 'Log In'}</Text>
      </TouchableOpacity>

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

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavAction}>
          <TouchableOpacity onPress={() => navigation.navigate('BarsIndex')}>
            <Image
              source={require('../assets/baricon_gray.png')}
              style={styles.barIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavAction}>
          <TouchableOpacity onPress={() => navigation.navigate('beers')}>
            <Image
              source={require('../assets/searchyellow.png')}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavAction}>
          <MaterialIcons name="map" size={24} color="#E3E5AF" onPress={() => navigation.navigate('BarsIndexMap')} />
        </View>
        <View style={styles.bottomNavAction}>
          <MaterialIcons name="person" size={24} color="#E3E5AF" onPress={() => navigation.navigate('SearchUsers')} />
        </View>
      </View>

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
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    width: 100,
    height: 100,
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
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#CFB523',
    padding: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#303030',
    borderTopWidth: 2,
    borderTopColor: '#CFB523',
    paddingVertical: 10,
  },
  bottomNavAction: {
    alignItems: 'center',
  },
  searchIcon: {
    width: 32,
    height: 26,
  },
  barIcon: {
    width: 60,
    height: 26,
  },
});

export default BeersReviewIndex;
