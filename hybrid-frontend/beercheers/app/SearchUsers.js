import React, { useEffect, useReducer, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@env';
import { saveItem, getItem } from '../Storage';

const initialState = {
  users: [],
  loading: true,
  error: null,
  searchTerm: '',
  currentUserId: null,
  friendships: {}
};

const actions = {
  SET_USERS: 'SET_USERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_CURRENT_USER_ID: 'SET_CURRENT_USER_ID',
  SET_FRIENDSHIPS: 'SET_FRIENDSHIPS',
  ADD_FRIENDSHIP: 'ADD_FRIENDSHIP',
  REMOVE_FRIENDSHIP: 'REMOVE_FRIENDSHIP'
};

const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_USERS:
      return { ...state, users: action.payload, loading: false };
    case actions.SET_LOADING:
      return { ...state, loading: true };
    case actions.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case actions.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
    case actions.SET_CURRENT_USER_ID:
      return { ...state, currentUserId: action.payload };
    case actions.SET_FRIENDSHIPS:
      const friendships = action.payload.reduce((acc, friendship) => {
        acc[friendship.friend.id] = true;
        return acc;
      }, {});
      return { ...state, friendships };
    case actions.ADD_FRIENDSHIP:
      return { ...state, friendships: { ...state.friendships, [action.payload]: true } };
    case actions.REMOVE_FRIENDSHIP:
      const updatedFriendships = { ...state.friendships };
      delete updatedFriendships[action.payload];
      return { ...state, friendships: updatedFriendships };
    default:
      return state;
  }
};

const SearchUsers = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [bars, setBars] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedBar, setSelectedBar] = useState('');
  const [filteredBars, setFilteredBars] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = await getItem('authToken');
        const token = storedToken ? storedToken.replace(/"/g, '') : null;
        if (!token) {
          router.push('/login');
          return;
        }

        const userResponse = await axios.get(`${BACKEND_URL}/api/v1/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const loggedInUserId = userResponse.data.current_user.id;
        const filteredUsers = userResponse.data.users.filter(user => user.id !== loggedInUserId);

        dispatch({ type: actions.SET_USERS, payload: filteredUsers });
        dispatch({ type: actions.SET_CURRENT_USER_ID, payload: loggedInUserId });

        const friendshipsResponse = await axios.get(`${BACKEND_URL}/api/v1/users/${loggedInUserId}/friendships`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        dispatch({ type: actions.SET_FRIENDSHIPS, payload: friendshipsResponse.data });

        const barsResponse = await axios.get(`${BACKEND_URL}/api/v1/bars`);
        setBars(barsResponse.data.bars || []);

        const eventsPromises = bars.map(async (bar) => {
          const eventsResponse = await axios.get(`${BACKEND_URL}/api/v1/bars/${bar.id}`);
          return { barId: bar.id, events: eventsResponse.data.events || [] };
        });
    
        const eventsData = await Promise.all(eventsPromises);
    
        const allEvents = eventsData.flatMap(eventData => eventData.events); 
        
        setEvents(allEvents);
        //console.log(events)
      } catch (error) {
        dispatch({ type: actions.SET_ERROR, payload: error.message });
      }
    };

    fetchData();
  }, [filteredEvents]);

  const handleAddFriend = async (userId) => {
    const storedToken = await getItem('authToken');
    const token = storedToken ? storedToken.replace(/"/g, '') : null;

    try {
      const barId = selectedBar ? selectedBar.id : null;
      const eventId = selectedEvent ? selectedEvent.id : null;

      await axios.post(
        `${BACKEND_URL}/api/v1/users/${state.currentUserId}/friendships`,
        { friendship: { friend_id: userId, bar_id: barId, event_id: eventId } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch({ type: actions.ADD_FRIENDSHIP, payload: userId });
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const handleRemoveFriend = async (userId) => {
    const storedToken = await getItem('authToken');
    const token = storedToken ? storedToken.replace(/"/g, '') : null;

    try {
      await axios.delete(`${BACKEND_URL}/api/v1/users/${state.currentUserId}/friendships/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch({ type: actions.REMOVE_FRIENDSHIP, payload: userId });
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleBarSearch = (text) => {
    setSelectedBar(text);
    const filtered = bars.filter(bar => bar.name.toLowerCase().includes(text.toLowerCase()));
    setFilteredBars(filtered);
  };

  const filteredUsers = state.users.filter(user =>
    user.handle.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  const handleEventSearch = (text) => {
    setSelectedEvent(text);
    const filtered = events.filter(event => event.name.toLowerCase().includes(text.toLowerCase()));
    setFilteredEvents(filtered);
  };

  if (state.loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />
      <Text style={styles.title}>Find a Friend</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Handle"
        value={state.searchTerm}
        onChangeText={(text) => dispatch({ type: actions.SET_SEARCH_TERM, payload: text })}
      />

      <TextInput
        style={styles.searchInput}
        placeholder="Search Bar"
        value={selectedBar.name || selectedBar}
        onChangeText={handleBarSearch}
      />

      <TextInput
        style={styles.searchInput}
        placeholder="Search Event"
        value={selectedEvent.name || selectedEvent}
        onChangeText={handleEventSearch}
      />

      {filteredBars.length > 0 && (
        <FlatList
          data={filteredBars}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
              setSelectedBar(item);
              setFilteredBars([]);
            }} style={styles.barItem}>
              <Text style={styles.barText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.barList}
        />
      )}

      {events.length > 0 && (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
              setSelectedEvent(item);
              setFilteredEvents([]);
            }} style={styles.barItem}>
              <Text style={styles.barText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.barList}
        />
      )}

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userHandle}>{item.handle}</Text>
            {state.friendships[item.id] ? (
              <TouchableOpacity onPress={() => handleRemoveFriend(item.id)} style={styles.removeButton}>
                <MaterialIcons name="cancel" size={24} color="red" />
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => handleAddFriend(item.id)} style={styles.addButton}>
                <MaterialIcons name="person-add" size={24} color="white" />
                <Text style={styles.buttonText}>Add Friend</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
          <MaterialIcons name="person" size={24} color="#CFB523" onPress={() => router.push('/SearchUsers')} />
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
    height: 100,
    alignSelf: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 32,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#D9D9D9',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  barList: {
    maxHeight: 150,
    backgroundColor: '#404040',
    borderRadius: 8,
    marginVertical: 10,
  },
  barItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
  },
  barText: {
    color: 'white',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#404040',
    borderRadius: 8,
    marginVertical: 5,
  },
  userHandle: {
    color: 'white',
    fontSize: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CFB523',
    padding: 8,
    borderRadius: 8,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D44D4D',
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
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
});

export default SearchUsers;