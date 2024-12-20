import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Image, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
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
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterValue, setFilterValue] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchText, setSearchText] = useState('');
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
          address: response.data.address,
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

          const user = await axios.get(`${BACKEND_URL}/api/v1/users/${post.user_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const user_name = user.data.handle;

          if (post.event_picture_id) {
            const photos = await fetchEventPhoto(post.event_id);
            const photo = photos.find((p) => String(p.id) === String(post.event_picture_id));
            
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
              buttonLink: `/BarsEvent/?barId=${post.bar_id}&id=${post.event_id}`,
              user_handle: user_name,
              type: "feed_photo",
              bar_id: post.bar_id,
            };
          } else {
            let bar_address;
            if (post.bar_id) {
              const bar = await fetchEventBar(post.bar_id);
              
              bar_address = bar?.address
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
              user_handle: user_name,
              type: "feed_review",
            };
          }
        })
      );

      setPosts(postsWithDetails);
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
            async received(data) {
              console.log('Nuevo dato recibido:', data);
  
              // Llama a enrichedPost de forma asincrónica
              try {
                const enrichedPost = await (async function formatPost(data) {
                  try {
                    const storedToken = await getItem('authToken');
                    const token = storedToken ? storedToken.replace(/"/g, '') : null;
  
                    // Obtener información del usuario
                    const userResponse = await axios.get(`${BACKEND_URL}/api/v1/users/${data.user_id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const user_name = userResponse.data.handle;
  
                    if (data.type === 'feed_photo') {
                      const photos = await fetchEventPhoto(data.event_id);
                      const photo = photos.find((p) => String(p.id) === String(data.event_picture_id));
  
                      return {
                        ...data,
                        time: data.created_at || new Date().toISOString(),
                        description: data.description,
                        beer_name: data.beer_name,
                        picture: photo?.url,
                        event_name: data.event_name,
                        bar_name: data.bar_name,
                        country_name: data.country_name,
                        tagged_users: photo?.tagged_users,
                        user_handle: user_name,
                      };
                    } else {
                      let bar_address;
                      if (data.bar_id) {
                        const bar = await fetchEventBar(data.bar_id);
                        bar_address = bar?.address;
                      } else {
                        bar_address = null;
                      }
  
                      return {
                        ...data,
                        time: data.created_at || new Date().toISOString(),
                        beer_name: data.beer_name,
                        beer_rating: data.rating_global,
                        user_rating: data.rating,
                        bar_name: data.bar_name || 'Nombre de Bar no disponible',
                        country_name: data.country_name || 'País no disponible',
                        bar_address: bar_address || 'Dirección no disponible',
                        buttonLink: `/BarsEventsIndex/?id=${data.bar_id}`,
                        user_handle: user_name,
                      };
                    }
                  } catch (error) {
                    console.error('Error formateando el post:', error);
                    return null;
                  }
                })(data);
  
                // Agrega el post enriquecido al estado si no es null
                if (enrichedPost) {
                  setPosts((prevPosts) => [enrichedPost, ...prevPosts]);
                }
              } catch (error) {
                console.error('Error procesando el post recibido:', error);
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
  }, [subscribed, filterValue, activeFilter]);

  const handleSearchChange = (text) => {
    setSearchText(text);
    setFilterValue(text); // Actualiza el filterValue también
  };

  // Filtrado de publicaciones
  const filteredPosts = posts.filter(post => {
    const lowerCaseFilterValue = filterValue.toLowerCase();

    if (filterValue === '') {
      // Si no hay texto en el campo de filtro, mostrar todas las publicaciones
      return true;
    }
  
    if (activeFilter && filterValue) {
      if (activeFilter === 'friend') {
        // Filtrar por amigo etiquetado
        return post.tagged_users && post.tagged_users.some(user => user.handle.toLowerCase().includes(lowerCaseFilterValue));
      }
  
      if (activeFilter === 'bar') {
        // Filtrar por bar
        return post.bar_name && post.bar_name.toLowerCase().includes(lowerCaseFilterValue);
      }
  
      if (activeFilter === 'country') {
        // Filtrar por país
        return post.country_name && post.country_name.toLowerCase().includes(lowerCaseFilterValue);
      }
  
      if (activeFilter === 'beer') {
        // Filtrar por cerveza
        return post.beer_name && post.beer_name.toLowerCase().includes(lowerCaseFilterValue);
      }
    }
  
    return true; // Si no hay filtro activo o no se está buscando, devolver todas las publicaciones
  });

  const handleFilterChange = (filterType, value) => {
    setActiveFilter(filterType);
    setFilterValue(value);
    setSearchText(''); // Limpiar el texto de búsqueda cuando se cambia el filtro
  };
  
  const clearFilter = () => {
    setActiveFilter(null);
    setFilterValue('');
    setSearchText(''); // Limpiar el texto de búsqueda
  };
  
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

            {item.user_handle && <Text style={styles.eventName}>{item.user_handle} ha subido una foto:</Text>}
            {item.event_name && <Text style={styles.description}>Sobre el evento: {item.event_name}</Text>}
            {/* Imagen del evento */}
            {item.picture && (
              <Image source={{ uri: item.picture }} style={styles.postImage} />
            )}
  
            {/* Descripción de la foto */}
            {item.description && <Text style={styles.description}>Descripción: {item.description}</Text>}
  
            {/* Etiquetas de los usuarios */}
            {item.description && <Text style={styles.description}>USUARIOS ETIQUETADOS:</Text>}
            {item.tagged_users && item.tagged_users.length > 0 && (
              <View style={styles.taggedUsersContainer}>
                {item.tagged_users.map((user) => (
                  <Text key={user.id} style={styles.taggedUser}>@{user.handle}</Text>
                ))}
              </View>
            )}
  
            {/* Detalles del evento */}
            {item.bar_name && <Text style={styles.barName}>Bar: {item.bar_name}</Text>}
            {item.country_name && <Text style={styles.barName}> País: {item.country_name}</Text>}
  
            {/* Botón para ver el evento */}
            <TouchableOpacity
              onPress={() => router.push(`/BarsEvent?barId=${item.bar_id}&id=${item.event_id}`)}
              style={styles.eventButton}
            >
              <Text style={styles.eventButtonText}>Ver Evento</Text>
            </TouchableOpacity>
          </View>
        )}
  
        {isReview && (
          <View style={styles.reviewPost}>
            <Text style={styles.postTime}>{new Date(item.created_at).toLocaleString()}</Text>
            {item.beer_name && <Text style={styles.eventName}>{item.user_handle} ha escrito una Review:</Text>}
            
            {item.beer_name && <Text style={styles.description}>Sobre la cerveza: {item.beer_name}</Text>}
            {item.text && <Text style={styles.description}>Reseña: {item.text}</Text>}
            {item.rating && <Text style={styles.beerName}>Rating: {item.rating}</Text>}
            {item.rating_global && <Text style={styles.beerName}>Rating global de la cerveza: {item.rating_global}</Text>}
            
            {/* Detalles del bar */}
            {item.bar_name && <Text style={styles.barName}>Bar: {item.bar_name}</Text>}
            {item.bar_id && 
            <Text style={styles.barName}>
              {item.bar_address ? `${item.bar_address.line1}, ${item.bar_address.city}, ${item.country_name}` : 'N/A'}
            </Text>}
            {item.bar_id && (
              <TouchableOpacity
                onPress={() => router.push(item.buttonLink)}
                style={styles.eventButton}
              >
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

      <View style={styles.filtersContainer}>
        <View style={styles.buttonRow}>
          <Button title="Filtrar por Amigo" onPress={() => handleFilterChange('friend', 'Amigo')} color="#CFB523" />
          <Button title="Filtrar por Bar" onPress={() => handleFilterChange('bar', 'Nombre del bar')} color="#CFB523" />
        </View>
        <View style={styles.buttonRow}>
          <Button title="Filtrar por País" onPress={() => handleFilterChange('country', 'País')} color="#CFB523" />
          <Button title="Filtrar por Cerveza" onPress={() => handleFilterChange('beer', 'Cerveza')} color="#CFB523" />
        </View>
        <Button title="Eliminar Filtro" onPress={clearFilter} color="#666" />
      </View>

      {activeFilter && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar por ${activeFilter}`}
            value={searchText}
            onChangeText={handleSearchChange}
          />
        </View>
      )}

      <FlatList
        data={filteredPosts}
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
  searchInput: {
    backgroundColor: '#D9D9D9',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  filtersContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10, // Espaciado entre filas
  },
  postContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#424242',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  postTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  postImage: {
    width: '100%', 
    height: undefined, 
    aspectRatio: 1.5, 
    resizeMode: 'cover', 
    borderRadius: 8,
    marginVertical: 10, 
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  taggedUsersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'center', 
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
    alignItems: 'center',
    textAlign: 'center',
  },
  barName: {
    fontSize: 16,
    color: '#E3E5AF',
    marginBottom: 5,
    textAlign: 'center',
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
    textAlign: 'center',
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