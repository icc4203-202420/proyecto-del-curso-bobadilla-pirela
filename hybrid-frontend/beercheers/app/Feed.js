import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Image, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import ActionCable from 'actioncable';
import { MaterialIcons } from '@expo/vector-icons'; 
import { getItem } from '../Storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@env';

// Ensure the WebSocket connection is authenticated
const createAuthenticatedCable = async () => {
  const token = (await getItem('authToken'))?.replace(/"/g, '');
  const url = new URL(BACKEND_URL);
  const BACKEND_IP = url.host;
  return ActionCable.createConsumer(`ws://${BACKEND_IP}/cable?token=${token}`);
};

const Feed = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [postdata, setPostsData] = useState([]);
  const [error, setError] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [filter, setFilter] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await getItem('user_id');
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error al obtener el user_id:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      setIsLoggedIn(!!token);
    };
  
    checkLoginStatus();
  }, []);

  const processFeedReviews = async (reviews, token) => {
    const processedReviews = await Promise.all(
      reviews.map(async (review) => {
        console.log(review)
        try {
          const beerResponse = await axios.get(`${BACKEND_URL}/api/v1/beers/${review.beer_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const beer = beerResponse.data;
          console.log(beer)
          const barsBeersResponse = await axios.get(`${BACKEND_URL}/api/v1/bars_beers`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const barIds = barsBeersResponse.data
            .filter((bb) => bb.beer_id === review.beer_id)
            .map((bb) => bb.bar_id);
  
          const bars = await Promise.all(
            barIds.map(async (barId) => {
              const barResponse = await axios.get(`${BACKEND_URL}/api/v1/bars/${barId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const bar = barResponse.data;
  
              const addressResponse = await axios.get(`${BACKEND_URL}/api/v1/addresses`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const address = addressResponse.data.find((addr) => addr.bar_id === barId);
  
              const countryResponse = await axios.get(`${BACKEND_URL}/api/v1/countries/${address.country_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
  
              return {
                ...bar,
                address,
                country: countryResponse.data,
              };
            })
          );
  
          return {
            ...review,
            beer: { ...beer, avg_rating: beer.avg_rating },
            bars,
          };
        } catch (error) {
          console.error('Error al procesar FeedReview:', error);
          return null;
        }
      })
    );
  
    return processedReviews.filter((review) => review !== null);
  };


  const fetchInitialPosts = async () => {
    try {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      const response = await axios.get(`${BACKEND_URL}/api/v1/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const processedPosts = await Promise.all(response.data.map(async (post) => {
        let processedData = {};
      
        if (post.event_picture_id) {
          console.log("Fetching event picture...");
          try {
            const eventPictureResponse = await axios.get(
              `${BACKEND_URL}/api/v1/events/${post.event_id}/event_pictures/${post.event_picture_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
      
            console.log(eventPictureResponse.data); // Verifica la respuesta aquí
      
            const eventPicture = eventPictureResponse.data;
      
            return {
              ...post,
              picture_url: eventPicture.attributes.url,
              taggedUsers: eventPicture.attributes.tagged_users,
            };
          } catch (error) {
            console.error('Error al procesar FeedPicture:', error);
            return null;
          }
        } else {
          // Si es una review, procesarlo con processFeedReview
          processedData = await processFeedReviews(post, token);
        }
      
        // Combina los datos procesados con los datos originales del post
        return { ...post, ...processedData };
      }));

      console.log(processedPosts)
      // Establecer los posts procesados completos en el estado
      setPosts(processedPosts.filter(post => post !== null));
    } catch (error) {
      console.error('Error al cargar las publicaciones:', error);
      setError('Error al cargar las publicaciones. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createAuthenticatedCable().then((cable) => {
      if (userId) {
        const channel = cable.subscriptions.create(
          { channel: 'FeedChannel', user_id: userId },
          {
            connected() {
              console.log('Canal conectado');
              setSubscribed(true);
            },
            received(data) {
              if (data.type) {
                console.log('Nuevo dato recibido:', data);
                if (data.type === 'feed_photo') {
                  setPosts((prevPosts) => [
                    { ...data, picture: data.picture },
                    ...prevPosts,
                  ]);
                } else {
                  setPosts((prevPosts) => [
                    { ...data, type: data.type },
                    ...prevPosts,
                  ]);
                };
              }
            },
          }
        );
  
        return () => {
          channel.unsubscribe();
        };
      }
    });
  }, [userId]);

  useEffect(() => {
    if (subscribed) {
      fetchInitialPosts();
    }
  }, [subscribed, filter]);
  

  const handleLogout = async () => {
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleFilterChange = (text) => {
    setFilter(text); 
    fetchInitialPosts();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CFB523" />
          <Text>Cargando publicaciones...</Text>
        </View>
      </View>
    );
  }
  
  const renderItem = ({ item }) => {
    if (item.rating) {
      return (
        <View style={styles.post}>
          <Text style={styles.title}>Review</Text>
          <Text>Beer: {item.beer.name}</Text>
          <Text>Avg Rating: {item.beer.avg_rating}</Text>
          <Text>Bars:</Text>
          {item.bars.map((bar) => (
            <View key={bar.id}>
              <Text>{bar.name}</Text>
              <Text>{bar.address.street}, {bar.country.name}</Text>
            </View>
          ))}
          <Text>{item.created_at}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.post}>
          <Text style={styles.title}>Picture</Text>
          <Image source={{ uri: item.picture_url }} style={styles.image} />
          <Text style={styles.taggedUsers}>
            Tagged Users:{' '}
            <Text style={styles.userHandles}>
              {item.taggedUsers.map((user) => user.handle).join(', ')}
            </Text>
          </Text>
          <Text>{item.created_at}</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={isLoggedIn ? handleLogout : handleLogin}
      >
        <Text style={styles.logoutButtonText}>{isLoggedIn ? 'Home' : 'Log In'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Feed</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <TextInput
        style={styles.filterInput}
        placeholder="Filtrar por amistad, bar, país o cerveza"
        value={filter}
        onChangeText={handleFilterChange}
      />
      
      <FlatList
        data={posts} 
        renderItem={renderItem} 
        keyExtractor={(item) => item.id.toString()}
      />

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavAction}>
          <TouchableOpacity onPress={() => router.push('/BarsIndex')}>
            <Image
              source={require('../assets/baricon_gray.png')}
              style={styles.barIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavAction}>
          <TouchableOpacity onPress={() => router.push('/beers')}>
            <Image
              source={require('../assets/searchgray.png')}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavAction}>
          <MaterialIcons name="map" size={24} color="#E3E5AF" onPress={() => router.push('/BarsIndexMap')} />
        </View>
        <View style={styles.bottomNavAction}>
          <MaterialIcons name="person" size={24} color="#E3E5AF" onPress={() => router.push('/SearchUsers')} />
        </View>
        <View style={styles.bottomNavAction}>
          <Icon name="list" size={24} color="#CFB523" onPress={() => router.push('/Feed')} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
  },
  icon: {
    width: 100,
    height: 'auto',
    marginBottom: 8,
    alignSelf: 'center',
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontWeight: '900',
    fontSize: 32,
    textShadow: '1px 3px 3px black',
  },
  photoItem: {
    marginVertical: 8,
    alignItems: 'center',
  },
  photoContainer: {
    width: 150,
    height: 150,
    overflow: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  eventPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  errorText: { color: 'red' },
  filterInput: { height: 40, borderColor: '#fff', borderWidth: 1, },
  postContainer: { marginBottom: 16 },
  eventName: { fontSize: 18, color: '#CFB523', fontWeight: 'bold' },
  postImage: { width: '100%', height: 200, resizeMode: 'cover', marginVertical: 8 },
  beerName: { fontSize: 18, color: '#CFB523', fontWeight: 'bold' },
  rating: { fontSize: 14, color: '#888' },
  description: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  userHandles: {
    color: '#CFB523',
  },
  bottomNavContainer: {
    position: 'bottom',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#303030',
    borderTopWidth: 2,
    borderTopColor: '#CFB523',
    paddingVertical: 10,
    marginTop: 20,
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
});

export default Feed;
