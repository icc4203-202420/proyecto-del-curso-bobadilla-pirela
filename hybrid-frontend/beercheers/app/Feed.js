import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import ActionCable from 'actioncable';
import { getItem } from '../Storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@env';

const Feed = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [photos, setPhotos] = useState({}); // Estado para almacenar fotos por event_id

  const router = useRouter();

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
  const fetchEventPhotos = async (eventId) => {
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
        const photoData = response.data.data;
        setPhotos(prevPhotos => ({
          ...prevPhotos,
          [eventId]: photoData.map(photo => ({
            id: photo.id,
            description: photo.attributes.description,
            url: photo.attributes.url,
          })),
        }));
      }
    } catch (error) {
      console.error('Error fetching event photos:', error);
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

      const postsWithImages = await Promise.all(
        response.data.map(async (post) => {
          if (post.event_id) {
            // Llamamos a fetchEventPhotos para obtener las fotos relacionadas con el event_id
            fetchEventPhotos(post.event_id);
          }
          return post;
        })
      );
      setPosts(postsWithImages);
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
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
});

export default Feed;
