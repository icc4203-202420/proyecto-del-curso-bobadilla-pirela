import React, { useState, useEffect, useReducer } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Button, FlatList, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { BACKEND_URL } from '@env';


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
  const { barId, id } = route.params;
  const [description, setDescription] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [picture, setPicture] = useState(null);
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('/login');
				setErrors({ submit: 'No se encontró el token de autenticación.' });
  			setLoading(false);
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


	const handleDescriptionChange= async (text) => {
		setDescription(text)
	};


	useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/v1/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.users) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => user.handle.toLowerCase().includes(selectedUser.toLowerCase()));

  const handleAddUser = (user) => {
    if (!selectedUsers.some(selected => selected.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSelectedUser('');
    } else {
      setErrors({ user: 'User already added' });
    }
  };

	const handleRemoveUser = (userId) => {
    setSelectedUsers((prevSelectedUsers) => 
      prevSelectedUsers.filter(user => user.id !== userId)
    );
  };

  const handleUploadPress = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      setErrors({ upload: 'Se necesitan permisos para acceder a la galería' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});
	
		if (!result.canceled) {
			const uri = result.assets[0].uri;

			const base64 = await fetch(uri)
					.then(response => response.blob())
					.then(blob => {
							return new Promise((resolve, reject) => {
									const reader = new FileReader();
									reader.onloadend = () => resolve(reader.result);
									reader.onerror = reject;
									reader.readAsDataURL(blob);
							});
					});

			setPicture(base64);
		}
	};

  const handleSubmit = async () => {
    if (!picture) {
      setErrors({picture: 'Please select a picture.'});
      return;
    }

		if (!description) {
      setErrors({description: 'Please add a description.'});
      return;
    }

    setLoading(true);
		setErrors({});

    const formData = new FormData();
    const base64Data = picture.split(',')[1];
		formData.append('event_picture[picture]', base64Data);
    formData.append('event_picture[description]', description);
    formData.append('event_picture[event_id]', id);

    selectedUsers.forEach(user => {
      formData.append('event_picture[user_ids][]', user.id);
    });

    try {
			const token = await AsyncStorage.getItem('token');
			console.log(token)
			if (!token) {
				setErrors({ submit: 'No se encontró el token de autenticación.' });
				setLoading(false);
				return;
			}
			
			const response = await fetch(`${BACKEND_URL}/api/v1/events/${id}/event_pictures`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				setErrors({ submit: data.errors?.submit || 'No se pudo subir la imagen.' });
				setLoading(false);
				return;
			}
			navigation.navigate('BarsEvent', { barId, id });

		} catch (error) {
			setErrors({ submit: 'Error uploading picture.' });
		} finally {
			setLoading(false);
		}
	};

  return (
    <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>
      <TouchableOpacity onPress={() => navigation.navigate('BarsEvent', {barId, id})} style={styles.backButton}>
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
        {'Add a Photo for this Event'}
      </Text>

      <TouchableOpacity onPress={handleUploadPress}>
				<View style={[styles.uploadButton, picture && { backgroundColor: '#CFB523' }]}>
					{picture ? (
						<Image source={{ uri: picture }} style={styles.imagePreview} />
					) : (
						<Text style={styles.uploadText}>+</Text>
					)}
				</View>
			</TouchableOpacity>
			{errors.upload && <Text style={styles.errorText}>{errors.upload}</Text>}
			{errors.picture && <Text style={styles.errorText}>{errors.picture}</Text>}

      <TextInput
        style={styles.descriptionInput}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={handleDescriptionChange}
      />
			{errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

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
            <TouchableOpacity onPress={() => handleAddUser(item)}>
              <Text style={styles.userItem}>{item.handle}</Text>
            </TouchableOpacity>
          )}
          style={styles.userList}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Text style={styles.selectedTitle}>Selected Users:</Text>
        {selectedUsers.map(user => (
          <View key={user.id} style={styles.selectedUserContainer}>
            <Text>{user.handle}</Text>
            <TouchableOpacity
							style={styles.removeButton}
							onPress={() => handleRemoveUser(user.id)}
						>
							<Text style={styles.removeButtonText}>Remove</Text>
						</TouchableOpacity>
					</View>
        ))}
      </View>
			{errors.users && <Text style={styles.errorText}>{errors.users}</Text>}
      {errors.user && <Text style={styles.errorText}>{errors.user}</Text>}

			{errors.submit && <Text style={styles.errorText}>{errors.submit}</Text>}
      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Submit photo</Text>}
      </TouchableOpacity>

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
	errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
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
    borderRadius: 100,
  },
	selectedTitle: {
    color: '#303030',
    backgroundColor: '#CFB523',
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Roboto, sans-serif',
    fontSize: 30,
    borderRadius: 8,
    padding: 5,
  },
	removeButton: {
    backgroundColor: 'red',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  autocompleteInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  userItem: {
    padding: 16,
    backgroundColor: '#e0e0e0',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  userList: {
    maxHeight: 200,
  },
  selectedUserContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#d0ffd0',
    marginVertical: 5,
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