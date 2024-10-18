import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token); // Establecer el estado según la existencia del token
    };
  
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user_id');
    router.push('/login');
  };

  const handleLogin = () => {
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
          style={styles.image2}
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
        onPress={() => router.push('/BarsIndexMap')}
      >
        <Icon name="map" size={100} color="#E3E5AF" />
        <Text style={styles.text}>Map</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/SearchUsers')}
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
  image2: {
    width: 140,
    height: 80,
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

export default Home;
