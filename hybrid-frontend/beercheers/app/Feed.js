import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import ActionCable from 'actioncable';
import { getItem } from '../Storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@env';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';

const createAuthenticatedCable = async () => {
  const token = (await getItem('authToken'))?.replace(/"/g, '');
  const BACKEND_IP = new URL(BACKEND_URL).host;
  return ActionCable.createConsumer(`ws://${BACKEND_IP}/cable?token=${token}`);
};

const Feed = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bar, setBar] = useState(null); 
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      setIsLoggedIn(!!token);

      if (!token) {
        router.push('/login'); // Asegúrate de que 'login' sea el nombre correcto de la pantalla de login
      }
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

  // Función para obtener las fotos del evento
  const fetchEventPhoto = async (eventId) => {
    try {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      const response = await axios.get(`${BACKEND_URL}/api/v1/events/${eventId}/event_pictures`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(photo => ({
          id: photo.id,
          description: photo.attributes.description,
          url: photo.attributes.url,
          tagged_users: photo.attributes.tagged_users,
        }));
      }
      return []; // Si no hay fotos, devuelve un arreglo vacío
    } catch (error) {
      console.error('Error fetching event photos:', error);
      return [];
    }
  };

  const fetchEventBar = async (barId) => {
    try {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      const response = await axios.get(`${BACKEND_URL}/api/v1/bars/${barId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data) {
        return {
          bar_address: response.data.address,
        };
      }
    } catch (error) {
      console.error('Error fetching bar details:', error);
      return { bar_name: null, bar_address: null }; // Manejo de errores
    }
  };  

  // Función para obtener las publicaciones iniciales
  const fetchInitialPosts = async () => {
    try {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      const response = await axios.get(`${BACKEND_URL}/api/v1/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const postsWithDetails = await Promise.all(
        response.data.map(async (post) => {
          if (post.event_picture_id) {
            const photos = await fetchEventPhoto(post.event_id);
            const photo = photos[0];

            return {
              ...post,
              time: post.created_at,
              description: post.description,
              beer_name: post.beer_name,
              picture: photo?.url,
              event_name: post.event_name,
              bar_name: post.bar_name,
              country_name: post.country_name,
              tagged_users: photo?.tagged_users,
              buttonLink: `/BarsEventIndex/?barId=${post.bar_id}&id=${post.event_id}`,
              type: "feed_photo",
            };
          } else {
            let bar_address;
            if (post.bar_id !== null) {
              await fetchEventBar(post.bar_id);
              bar_address = bar.bar_address
            } else {
              bar_address = null;
            }
            return {
              ...post,
              time: post.created_at,
              beer_name: post.beer_name,
              beer_rating: post.rating_global,
              user_rating: post.rating,
              bar_name: post.bar_name || 'Nombre de Bar no disponible',
              country_name: post.country_name || 'País no disponible',
              bar_address: bar_address || 'Dirección no disponible',
              buttonLink: `/BarsEventsIndex/?id=${post.bar_id}`,
              type: "feed_review",
            };
          }
        })
      );

      setPosts(postsWithDetails);
    } catch (error) {
      console.log(error)
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


  // Componente para renderizar cada item en el feed
  const renderItem = ({ item }) => {
  const isPicture = item.event_id;
  const isReview = !item.event_id;

  return (
    <View style={styles.postContainer}>
      {isPicture && (
        <View style={styles.picturePost}>
          {/* Hora de la publicación */}
          <Text style={styles.postTime}>{new Date(item.created_at).toLocaleString()}</Text>

          {/* Imagen del evento */}
          {item.picture && <Image source={{ uri: item.picture }} style={styles.postImage} />}
          
          {/* Descripción de la foto */}
          {item.description && <Text style={styles.description}>{item.description}</Text>}

          {/* Etiquetas de los usuarios */}
          {item.tagged_users && item.tagged_users.length > 0 && (
            <View style={styles.taggedUsersContainer}>
              {item.tagged_users.map((user) => (
                <Text key={user.id} style={styles.taggedUser}>@{user.handle}</Text>
              ))}
            </View>
          )}

          {/* Detalles del evento */}
          {item.event_name && <Text style={styles.eventName}>{item.event_name}</Text>}
          {item.bar_name && <Text style={styles.barName}>{item.bar_name}</Text>}
          {item.country_name && <Text style={styles.country}>{item.country_name}</Text>}

          {/* Botón para ver el evento */}
          <TouchableOpacity onPress={() => router.push(`/BarsEventIndex/?barId=${item.bar_id}&id=${item.event_id}`)} style={styles.eventButton}>
            <Text style={styles.eventButtonText}>Ver Evento</Text>
          </TouchableOpacity>
        </View>
      )}

      {isReview && (
        <View style={styles.reviewPost}>
          {/* Detalles de la reseña */}
          {item.event_name && <Text style={styles.eventName}>{item.event_name}</Text>}
          {item.beer_name && <Text style={styles.beerName}>{item.beer_name} Review</Text>}
          {item.text && <Text style={styles.description}>{item.text}</Text>}
          {item.rating && <Text style={styles.rating}>Rating: {item.rating}</Text>}

          {/* Detalles del bar */}
          {item.bar_name && <Text style={styles.barName}>{item.bar_name}</Text>}
          {item.bar_address && <Text style={styles.barAddress}>{item.bar_address}</Text>}
          {item.bar && (
            <TouchableOpacity onPress={() => router.push(item.buttonLink)} style={styles.eventButton}>
              <Text style={styles.eventButtonText}>Ver Bar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
    );
  };
  

  if (loading) {
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
        <ActivityIndicator size="large" color="#CFB523" />
        <Text>Cargando publicaciones...</Text>
      </View>
    );
  }

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
        onChangeText={setFilter}
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
    padding: 10,
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontWeight: '900',
    fontSize: 32,
    textShadow: '1px 3px 3px black',
  },
  postContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#424242',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginVertical: 10,
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  taggedUsersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  taggedUser: {
    color: '#CFB523',
    marginRight: 5,
  },
  eventName: {
    fontSize: 18,
    color: '#CFB523',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  barName: {
    fontSize: 16,
    color: '#E3E5AF',
    marginBottom: 5,
  },
  country: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  eventButton: {
    backgroundColor: '#CFB523',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  eventButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  beerName: {
    fontSize: 16,
    color: '#CFB523',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rating: {
    fontSize: 14,
    color: '#888',
  },
  barAddress: {
    fontSize: 14,
    color: '#E3E5AF',
    marginTop: 5,
  },
  reviewPost: {
    marginBottom: 10,
  },
  picturePost: {
    marginBottom: 10,
  },
  filterInput: {
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    color: '#fff',
    paddingLeft: 10,
    marginBottom: 15,
    borderRadius: 5,
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