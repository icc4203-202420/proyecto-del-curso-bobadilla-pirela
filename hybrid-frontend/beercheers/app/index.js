import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const Home = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Establecer el estado según la existencia del token
  }, []);

  const handleLogout = () => {
    // Eliminar el token de localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    // Redirigir a la página de inicio de sesión
    router.push('/login');
  };

  const handleLogin = () => {
    // Redirigir a la página de inicio de sesión
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={isLoggedIn ? handleLogout : handleLogin}
      >
        <Text style={styles.logoutButtonText}>{isLoggedIn ? 'Log Out' : 'Log In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/bars')}
      >
        <Image
          source={require('../assets/baricon_gray.png')}
          style={styles.image}
        />
        <Text style={styles.text}>Bars</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/beers')}
      >
        <Image
          source={require('../assets/searchgray.png')}
          style={styles.image}
        />
        <Text style={styles.text}>Search</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/bars-index-map')}
      >
        <Icon name="ios-map" size={100} color="#E3E5AF" />
        <Text style={styles.text}>Map</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/search-users')}
      >
        <Icon name="person" size={100} color="#E3E5AF" />
        <Text style={styles.text}>User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#303030',
    padding: 20,
  },
  card: {
    backgroundColor: '#303030',
    width: 300,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
    borderColor: '#E3E5AF',
    borderWidth: 1,
  },
  text: {
    fontSize: 24,
    color: '#E3E5AF',
    marginTop: 10,
  },
  image: {
    width: 80,
    height: 80,
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#CFB523', // Amarillo
    padding: 10,
    borderRadius: 5,
    zIndex: 1, // Asegúrate de que el botón esté por encima de otros componentes
  },
  logoutButtonText: {
    color: 'white', // Texto blanco
    fontSize: 16,
  },
});

export default Home;
