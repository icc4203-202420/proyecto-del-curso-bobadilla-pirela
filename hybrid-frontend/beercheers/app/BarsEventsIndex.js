import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import main_icon from '../assets/icon_beercheers.png';
import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BarsEventsIndex = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { barId } = route.params;
  const [bar, setBar] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/v1/bars/${barId}/events`)
      .then(response => {
        setBar(response.data || {});
        setEvents(response.data.events || []);
      })
      .catch(error => {
        console.error("No se pudieron capturar los datos del bar!", error);
      });
  }, [barId]);

  const handleNavigateBack = () => {
    navigation.goBack();
  };

  const handleEventPress = (eventId) => {
    navigation.navigate(`EventDetails`, { eventId });
  };

  const handleLogout = async () => {
    navigation.navigate('index');
  };

  const handleLogin = () => {
    navigation.navigate('login');
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleNavigateBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={isLoggedIn ? handleLogout : handleLogin}
      >
        <Text style={styles.logoutButtonText}>{isLoggedIn ? 'Home' : 'Log In'}</Text>
      </TouchableOpacity>

      <Image source={main_icon} style={styles.mainIcon} />

      {bar && (
        <View style={styles.barInfo}>
          <Text style={styles.barName}>{bar.name}</Text>
          {bar.image_url && (
            <Image source={{ uri: bar.image_url }} style={styles.barImage} />
          )}
          <Text style={styles.barAddress}>
            {bar.address?.line1}
            {bar.address?.line2 && `, ${bar.address.line2}`}
            {bar.address?.city && `, ${bar.address.city}`}
            {bar.address?.country && `, ${bar.address.country}`}
          </Text>
        </View>
      )}

      <Text style={styles.eventsTitle}>Events</Text>
      
      <FlatList
        data={events}
        keyExtractor={event => event.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleEventPress(item.id)} style={styles.eventItem}>
            <Text style={styles.eventName}>{item.name}</Text>
            <Text style={styles.eventDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noEvents}>No events available</Text>}
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
    padding: 20,
  },
  backButton: {
    backgroundColor: '#CFB523',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  mainIcon: {
    width: 100,
    height: 'auto',
    marginBottom: 10,
  },
  barInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  barName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  barImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  barAddress: {
    color: 'white',
    textAlign: 'center',
  },
  eventsTitle: {
    color: '#CFB523',
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 10,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CFB523',
  },
  eventName: {
    color: 'white',
  },
  eventDate: {
    color: '#CFB523',
  },
  noEvents: {
    color: 'white',
    textAlign: 'center',
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
});

export default BarsEventsIndex;
