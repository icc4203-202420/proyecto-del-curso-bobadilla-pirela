import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BACKEND_URL } from '@env';
import { saveItem, getItem } from '../Storage';

const BarsEventsPhotoIndex = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { barId, id } = route.params;
  const [photos, setPhotos] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      setIsLoggedIn(!!token);
      if (!token) {
        navigation.navigate('login');
      }
    };
  
    checkLoginStatus();
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('index');
  };

  const handleLogin = () => {
    navigation.navigate('login');
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const storedToken = await getItem('authToken');
        const token = storedToken ? storedToken.replace(/"/g, '') : null;
        const response = await axios.get(`${BACKEND_URL}/api/v1/events/${id}/event_pictures`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Photos data: ", response.data.data);

        if (response.data.data && Array.isArray(response.data.data)) {
          const photoData = response.data.data;
          setPhotos(photoData.map(photo => ({
            id: photo.id,
            description: photo.attributes.description,
            url: photo.attributes.url,
            createdAt: photo.attributes.created_at,
            updatedAt: photo.attributes.updated_at,
            taggedUsers: photo.attributes.tagged_users,
          })));
        } else {
          console.warn('Unexpected response structure:', response.data.data);
          setPhotos([]);
        }
      } catch (error) {
        console.error('Error fetching event photos:', error);
        setPhotos([]);
      }
    };

    fetchPhotos();
  }, [id]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={isLoggedIn ? handleLogout : handleLogin}
      >
        <Text style={styles.logoutButtonText}>{isLoggedIn ? 'Home' : 'Log In'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Photos for this event</Text>

      <FlatList
        data={photos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.photoItem}>
            <View style={styles.photoContainer}>
              <Image source={{ uri: item.url }} style={styles.eventPhoto} />
            </View>
            <Text style={styles.description}>{item.description || 'No description'}</Text>
            {item.taggedUsers && item.taggedUsers.length > 0 ? (
              <Text style={styles.taggedUsers}>
                Tagged Users: <Text style={styles.userHandles}>{item.taggedUsers.map(user => user.handle).join(', ')}</Text>
              </Text>
            ) : (
              <Text>No users tagged</Text>
            )}
          </View>
        )}
      />

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavAction}>
          <TouchableOpacity onPress={() => navigation.navigate('BarsIndex')}>
            <Image
              source={require('../assets/baricon.png')}
              style={styles.barIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavAction}>
          <TouchableOpacity onPress={() => navigation.navigate('beers')}>
            <Image
              source={require('../assets/searchgray.png')}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavAction}>
          <MaterialIcons name="map" size={24} color="#E3E5AF" onPress={() => navigation.navigate('BarsIndexMap')} />
        </View>
        <View style={styles.bottomNavAction}>
          <MaterialIcons name="person" size={24} color="#E3E5AF" onPress={() => navigation.navigate('SearchUsers')} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
    padding: 16,
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
  description: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  taggedUsers: {
    color: 'white',
    textAlign: 'center',
  },
  userHandles: {
    color: '#CFB523',
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

export default BarsEventsPhotoIndex;
