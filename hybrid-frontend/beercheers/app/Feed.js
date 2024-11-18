import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import ActionCable from 'actioncable';
import { getItem } from '../Storage';
import axios from 'axios';

// Ensure the WebSocket connection is authenticated
const createAuthenticatedCable = async () => {
  const token = (await getItem('authToken'))?.replace(/"/g, '');
  return ActionCable.createConsumer(`ws://192.168.100.13:3001/cable?token=${token}`);
};

const Feed = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(16); // Replace with actual logic to get the authenticated user's ID
  const [error, setError] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [filter, setFilter] = useState(''); // State to handle filters

  // Fetch initial posts based on filters
  const fetchInitialPosts = async () => {
    try {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      const response = await axios.get('http://192.168.100.13:3001/api/v1/feed_reviews', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { filter },
      });
      setPosts(response.data);
    } catch (error) {
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
              setPosts((prevPosts) => [data, ...prevPosts]);
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

  const handleFilterChange = (newFilter) => {
    if (newFilter !== filter) {
      setFilter(newFilter);
      setLoading(true);
      fetchInitialPosts();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.post}>
      <Text style={styles.username}>{item.user_id} evaluó</Text>
      <Text style={styles.text}>Cerveza: {item.beer_name}</Text>
      <Text>Evaluación: {item.rating}</Text>
      <Button
        title="Ver Evento"
        onPress={() => navigation.navigate('EventDetails', { eventId: item.event_id })}
      />
      <Button
        title="Ver Bar"
        onPress={() => navigation.navigate('BarDetails', { barId: item.bar_id })}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
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
        onChangeText={handleFilterChange}
      />
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  post: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    marginVertical: 5,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default Feed;
