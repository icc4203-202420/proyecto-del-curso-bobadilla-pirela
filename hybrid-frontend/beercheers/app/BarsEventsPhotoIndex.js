import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Video } from 'expo-av';
import { BACKEND_URL } from '@env';
import { Link, useRouter } from 'expo-router';
import { deleteItem, getItem } from '../Storage';
import { ScrollView } from 'react-native-web';

const BarsEventsPhotoIndex = () => {
  const route = useRoute();
  const router = useRouter();
  const navigation = useNavigation();
  const { barId, id } = route.params;
  const [photos, setPhotos] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

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
    await deleteItem('authToken');
    await deleteItem('user_id');
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

  const handleCreateVideo = async () => {
    if (photos.length === 0) {
      Alert.alert('Error', 'No photos available to create a video.');
      return;
    }
  
    const photoUrls = photos.map(photo => photo.url);
  
    try {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      const response = await axios.post(`${BACKEND_URL}/api/v1/events/${id}/create_video`, {
        photo_urls: photoUrls,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      Alert.alert('Video Creation', response.data.message);
      fetchVideoUrl();
    } catch (error) {
      console.error('Error creating video:', error);
      Alert.alert('Error', 'An error occurred while creating the video.');
    }
  };
  
  const fetchVideoUrl = async () => {
    try {
      const storedToken = await getItem('authToken');
      const token = storedToken ? storedToken.replace(/"/g, '') : null;
      const response = await axios.get(`${BACKEND_URL}/api/v1/events/${id}/get_video`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data.video_url) {
        setVideoUrl(response.data.video_url);
        setIsVideoReady(true);
      } else {
        Alert.alert('Error', 'Video URL not found.');
      }
    } catch (error) {
      console.error('Error fetching video URL:', error);
      Alert.alert('Error', 'Failed to retrieve the video URL.');
    }
  };

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

      <TouchableOpacity style={styles.createVideoButton} onPress={handleCreateVideo}>
        <Text style={styles.createVideoButtonText}>Create Video</Text>
      </TouchableOpacity>

      {isVideoReady && videoUrl && (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        </View>
      )}

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
          <Icon name="list" size={24} color="#E3E5AF" onPress={() => router.push('/Feed')} />
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
  createVideoButton: {
    backgroundColor: '#CFB523',
    padding: 12,
    borderRadius: 5,
    marginVertical: 16,
    alignItems: 'center',
  },
  createVideoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 10,
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

export default BarsEventsPhotoIndex;
