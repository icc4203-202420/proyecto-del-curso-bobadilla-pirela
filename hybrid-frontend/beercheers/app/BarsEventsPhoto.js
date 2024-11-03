import React, { useState, useEffect, useReducer } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const initialState = {
  users: [],
  currentUserId: null,
  loading: false,
  error: null,
};

const actions = {
  SET_LOADING: 'SET_LOADING',
  SET_USERS: 'SET_USERS',
  SET_CURRENT_USER_ID: 'SET_CURRENT_USER_ID',
  SET_ERROR: 'SET_ERROR',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_LOADING:
      return { ...state, loading: true };
    case actions.SET_USERS:
      return { ...state, users: action.payload, loading: false };
    case actions.SET_CURRENT_USER_ID:
      return { ...state, currentUserId: action.payload };
    case actions.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const BarsEventsPhoto = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter();
  const { barId, eventId } = route.params;
  const { eventName } = route.params;
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [picture, setPicture] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('/login');
      }
    };
    
    fetchToken();
  }, [navigation]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
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
    const fetchUsers = async () => {
      dispatch({ type: actions.SET_LOADING });

      try {
        const token = AsyncStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/v1/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.current_user && response.data.users) {
          const loggedInUserId = response.data.current_user.id;
          const allUsers = response.data.users;
          const filteredUsers = allUsers.filter(user => user.id !== loggedInUserId);

          dispatch({ type: actions.SET_USERS, payload: filteredUsers });
          dispatch({ type: actions.SET_CURRENT_USER_ID, payload: loggedInUserId });
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        dispatch({ type: actions.SET_ERROR, payload: error.message });
      }
    };

    fetchUsers();
  }, []);

  const handleDescriptionChange = (text) => {
    setDescription(text);
  };

  const handleSubmit = async () => {
    if (!state.currentUserId || selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select users and provide a picture.');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('event_picture[picture]', {
      uri: picture.uri,
      name: picture.name,
      type: picture.type,
    });
    formData.append('event_picture[description]', description);
    formData.append('event_picture[event_id]', eventId);
    
    selectedUsers.forEach(user => {
      formData.append('event_picture[user_ids][]', user.id);
    });

    try {
      const token = AsyncStorage.getItem('token');
      const response = await axios.post(`${BACKEND_URL}/api/api/v1/events/${eventId}/event_pictures`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      navigation.navigate(`BarsEventsIndex?id=${barId}`);
    } catch (error) {
      console.error('Error uploading picture:', error);
      Alert.alert('Error', 'Error uploading picture.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = state.users.filter(user => user.handle.toLowerCase().includes(selectedUser.toLowerCase()));

  const handleAddUser = () => {
    const user = state.users.find(u => u.handle === selectedUser);
    if (user && !selectedUsers.some(selected => selected.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSelectedUser('');
    }
  };

  const handleUploadPress = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Se necesitan permisos para acceder a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPicture(result.assets[0]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate(`BarsEventsIndex?id=${barId}`)} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={isLoggedIn ? handleLogout : handleLogin}
      >
        <Text style={styles.logoutButtonText}>{isLoggedIn ? 'Home' : 'Log In'}</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>
        {eventName ? eventName : 'Add a Photo for this Event'}
      </Text>

      <TouchableOpacity onPress={handleUploadPress}>
				<View style={[styles.uploadButton, picture && { backgroundColor: '#CFB523' }]}>
					{picture ? (
						<Image source={{ uri: picture.uri }} style={styles.imagePreview} />
					) : (
						<Text style={styles.uploadText}>+</Text>
					)}
				</View>
			</TouchableOpacity>

      <TextInput
        style={styles.descriptionInput}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={handleDescriptionChange}
      />

      <TextInput
        style={styles.autocompleteInput}
        placeholder="Search Users by Handle"
        value={selectedUser}
        onChangeText={text => setSelectedUser(text)}
      />

      {filteredUsers.length > 0 && (
        <FlatList
        data={filteredUsers}
        keyExtractor={user => user.id.toString()}
        renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
            setSelectedUser(item.handle);
            handleAddUser();
            }}>
            <Text style={styles.userItem}>{item.handle}</Text>
            </TouchableOpacity>
        )}
        style={styles.userList}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false} 
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
        <Text style={styles.addButtonText}>Add User</Text>
      </TouchableOpacity>

      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsers}>
          <Text style={styles.selectedUsersTitle}>Selected Users:</Text>
          {selectedUsers.map(user => (
            <View key={user.id} style={styles.selectedUser}>
              <Text>{user.handle}</Text>
              <TouchableOpacity onPress={() => {
                setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
              }}>
                <Text style={styles.removeUser}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Submit photo</Text>}
      </TouchableOpacity>

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavAction}>
          <TouchableOpacity onPress={() => navigation.navigate('bars')}>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#333',
  },
  backButton: {
    marginBottom: 16,
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  uploadButton: {
    width: 100,
    height: 100,
		flex: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CFB523',
    borderRadius: 100,
    backgroundColor: '#CFB523',
		alignSelf: 'center',
		marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  uploadText: {
    fontSize: 24,
    color: '#fff',
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    color: '#606060',
  },
  autocompleteInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 8,
    color: '#606060',
  },
  addButton: {
    backgroundColor: '#CFB523',
    borderRadius: 8,
    alignSelf: 'center',
    padding: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  selectedUsers: {
    marginBottom: 16,
  },
  selectedUsersTitle: {
    color: '#606060',
    fontSize: 18,
    marginBottom: 8,
  },
  selectedUser: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  removeUser: {
    color: 'red',
  },
  submitButton: {
    backgroundColor: '#CFB523',
    borderRadius: 8,
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
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

export default BarsEventsPhoto;