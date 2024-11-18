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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [filter, setFilter] = useState(''); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
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

  const fetchInitialPosts = async () => {
    try {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      const response = await axios.get(`${BACKEND_URL}/api/v1/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response)
      setPosts(response.data);
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
    // Si el item es una foto
    if (item.event_picture_id) {
      return (
        <View style={styles.postContainer}>
          <Text style={styles.eventName}>{item.event_name}</Text>
          <Image source={{ uri: item.picture }} style={styles.postImage} />
          <Text style={styles.description}>{item.description}</Text>
        </View>
      );
    }
    // Si el item es una reseña
    else {
      return (
        <View style={styles.postContainer}>
          <Text style={styles.beerName}>{item.beer_name} Review</Text>
          <Text style={styles.description}>{item.text}</Text>
          <Text style={styles.rating}>Rating: {item.rating}</Text>
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
              source={require('../assets/baricon.png')}
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
