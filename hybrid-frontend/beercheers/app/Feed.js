import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Image, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import ActionCable from 'actioncable';
import { getItem } from '../Storage';
import axios from 'axios';
import { BACKEND_URL } from '@env';

// Ensure the WebSocket connection is authenticated
const createAuthenticatedCable = async () => {
  const token = (await getItem('authToken'))?.replace(/"/g, '');
  return ActionCable.createConsumer(`ws://192.168.4.101:3000/cable?token=${token}`);
};

const Feed = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // Replace with actual logic to get the authenticated user's ID
  const [error, setError] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [filter, setFilter] = useState(''); // State to handle filters
  
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

  // Fetch initial posts based on filters
  const fetchInitialPosts = async () => {
    try {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      // Realiza la solicitud al nuevo endpoint combinado
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

  // Set up real-time WebSocket connection
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

  const handleFilterChange = (text) => {
    setFilter(text); // Actualiza el filtro
    fetchInitialPosts(); // Vuelve a cargar los posts con el nuevo filtro
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando publicaciones...</Text>
      </View>
    );
  }
  
  const renderItem = ({ item }) => {
    // Si el item es una foto
    if (item.event_picture_id) {
      return (
        <View style={styles.postContainer}>
          <Text style={styles.eventName}>{item.event_name}</Text>
          <Image source={{ uri: item.picture_url }} style={styles.postImage} />
          <Text style={styles.description}>{item.description}</Text>
        </View>
      );
    }
    // Si el item es una reseña
    else {
      return (
        <View style={styles.postContainer}>
          <Text style={styles.beerName}>{item.beer_name} Review</Text>
          <Text style={styles.reviewText}>{item.text}</Text>
          <Text style={styles.rating}>Rating: {item.rating}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feed</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {/* Filtro de búsqueda */}
      <TextInput
        style={styles.filterInput}
        placeholder="Filtrar por amistad, bar, país o cerveza"
        value={filter}
        onChangeText={handleFilterChange}
      />
      
      {/* FlatList para mostrar las publicaciones */}
      <FlatList
        data={posts} // Array de publicaciones combinadas (fotos y reseñas)
        renderItem={renderItem} // Función para renderizar cada item
        keyExtractor={(item) => item.id.toString()} // Usamos el id de la publicación como clave
        inverted // Invertir el orden para mostrar las más recientes primero
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  errorText: { color: 'red' },
  filterInput: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 16, paddingLeft: 8 },
  postContainer: { marginBottom: 16 },
  eventName: { fontSize: 18, fontWeight: 'bold' },
  postImage: { width: '100%', height: 200, resizeMode: 'cover', marginVertical: 8 },
  description: { fontSize: 16 },
  beerName: { fontSize: 18, fontWeight: 'bold' },
  reviewText: { fontSize: 16 },
  rating: { fontSize: 14, color: '#888' },
});

export default Feed;
