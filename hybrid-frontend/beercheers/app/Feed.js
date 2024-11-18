import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import ActionCable from 'actioncable';
import { getItem } from '../Storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons'; 
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@env';

const Feed = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [photos, setPhoto] = useState({});
  const [review, setReview] = useState([]);
  const [error, setError] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [filter, setFilter] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
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

  // Función para obtener las publicaciones iniciales
  const fetchInitialPosts = async () => {
    try {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      const posts = await axios.get(`${BACKEND_URL}/api/v1/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const processedData = await Promise.all(posts.data.map(async (post) => {
        let processedPost = {};
  
        // Si es una foto (FeedPicture)
        if (post.event_picture_id) {
          console.log("Procesando FeedPicture...");
  
          try {
            // Hacer fetch a las fotos del evento
            const eventPictureResponse = await axios.get(
              `${BACKEND_URL}/api/v1/events/${post.event_id}/event_pictures/${post.event_picture_id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
  
            const eventPicture = eventPictureResponse.data;
            // Almacenar los datos de la foto en setPhotos
            setPhotos(prevPhotos => ({
              ...prevPhotos,
              [post.event_id]: eventPicture.attributes.url, 
            }));
  
            // Procesamos el post con los datos de la foto
            processedPost = {
              ...post,
              picture_url: eventPicture.attributes.url,
              taggedUsers: eventPicture.attributes.tagged_users,
            };
          } catch (error) {
            console.error('Error al procesar FeedPicture:', error);
          }
        } else {
          // Si es una review (FeedReview), procesarlo con processFeedReviews
          console.log("Procesando FeedReview...");

        }
  
        // Retornar el post procesado (con los datos de la foto o la reseña)
        return processedPost;
      }));
  
      // Establecer los posts procesados completos en el estado
      setPosts(posts.data);
    } catch (error) {
      console.error('Error al cargar las publicaciones:', error);
      setError('Error al cargar las publicaciones. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialPosts();
  }, []);

  // Componente para renderizar cada item en el feed
  const renderItem = ({ item }) => {
    const eventPhotos = photos[item.event_id]; // Obtenemos las fotos para el event_id
  
    // Verificamos si la publicación es una "review" o una "picture"
    const isReview = item.text && !item.event_id;  // Si tiene texto pero no un event_id, es una review
    const isPicture = item.event_id; // Si tiene un event_id, es una picture
    console.log(eventPhotos)
    return (
      <View style={styles.postContainer}>
        {isPicture && eventPhotos && eventPhotos.length > 0 && (
          <View>
            {/* Mostrar detalles específicos para picture */}
            <Text style={styles.postTime}>{item.created_at}</Text> {/* Hora de la publicación */}
            <Image source={{ uri: eventPhotos[0].url }} style={styles.postImage} />
            {item.description && <Text style={styles.description}>{item.description}</Text>}
  
            {/* Etiquetas de usuarios en la foto */}
            {item.tagged_users && item.tagged_users.length > 0 && (
              <View style={styles.taggedUsersContainer}>
                {item.tagged_users.map((user) => (
                  <Text key={user.id} style={styles.taggedUser}>
                    @{user.handle}
                  </Text>
                ))}
              </View>
            )}
  
            {/* Detalles del evento */}
            {item.event_name && <Text style={styles.eventName}>{item.event_name}</Text>}
            {item.bar_name && <Text style={styles.barName}>{item.bar_name}</Text>}
            {item.country && <Text style={styles.country}>{item.country}</Text>}
  
            {/* Botón para ir al evento */}
            <TouchableOpacity onPress={() => router.push(`/event/${item.event_id}`)} style={styles.eventButton}>
              <Text style={styles.eventButtonText}>Ver Evento</Text>
            </TouchableOpacity>
          </View>
        )}
  
        {isReview && (
          <View>
            {/* Mostrar detalles específicos para review */}
            {item.event_name && <Text style={styles.eventName}>{item.event_name}</Text>}
            {item.beer_name && <Text style={styles.beerName}>{item.beer_name} Review</Text>}
            {item.text && <Text style={styles.description}>{item.text}</Text>}
            {item.rating && <Text style={styles.rating}>Rating: {item.rating}</Text>}
          </View>
        )}
      </View>
    );
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#CFB523" />
        <Text>Cargando publicaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />
      <Text style={styles.title}>Feed</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={isLoggedIn ? handleLogout : handleLogin}
      >
        <Text style={styles.logoutButtonText}>{isLoggedIn ? 'Home' : 'Log In'}</Text>
      </TouchableOpacity>

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
  postContainer: { marginBottom: 16 },
  eventName: { fontSize: 18, color: '#CFB523', fontWeight: 'bold' },
  postImage: { width: '100%', height: 200, resizeMode: 'contain', marginVertical: 8 },
  beerName: { fontSize: 18, color: '#CFB523', fontWeight: 'bold' },
  rating: { fontSize: 14, color: '#888' },
  description: { color: 'white', textAlign: 'center', fontFamily: 'Roboto' },
  errorText: { color: 'red' },
  filterInput: { height: 40, borderColor: '#fff', borderWidth: 1 },
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
