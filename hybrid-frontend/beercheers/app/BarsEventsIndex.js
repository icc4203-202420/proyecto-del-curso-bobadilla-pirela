import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BACKEND_URL } from '@env';

function BarsEventsIndex() {
  const [bar, setBar] = useState(null);
  const [events, setEvents] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/bars/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBar(data);
        setEvents(data.events || []);
        console.log(data)
      } catch (error) {
        console.error("Error fetching bar data", error);
      }
    };

    fetchData();
  }, [id]);

  const renderEvent = ({ item }) => (
    <Link href={`/BarsEvent?barId=${bar.id}&id=${item.id}`} style={styles.eventItem}>
      <View style={styles.eventContainer}>
        <Text style={styles.eventName}>{item.name}</Text>
        <Text style={styles.eventDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </Link>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('bars')} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={isLoggedIn ? handleLogout : handleLogin}
      >
        <Text style={styles.logoutButtonText}>{isLoggedIn ? 'Home' : 'Log In'}</Text>
      </TouchableOpacity>
      
      {bar && (
        <View style={styles.barDetails}>
          <Text style={styles.barName}>{bar.name}</Text>
          {bar.image_url && (
            <Image source={{ uri: bar.image_url }} style={styles.barImage} />
          )}
          <Text style={styles.address}>
            {bar.address?.line1}
            {bar.address?.line2 ? `, ${bar.address.line2}` : ''}
            {'\n'}
            {bar.address?.city}
            {bar.address?.country ? `, ${bar.address.country}` : ''}
          </Text>
        </View>
      )}

      <Text style={styles.eventsTitle}>Events</Text>
      {events.length > 0 ? (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noEventsText}>No events available</Text>
      )}

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
    backgroundColor: '#303030',
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: 'white',
    fontSize: 24,
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 10,
  },
  barDetails: {
    alignItems: 'center',
    marginVertical: 20,
  },
  barName: {
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Roboto, sans-serif',
    fontWeight: '900',
    fontSize: 50,
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 3,
  },
  barImage: {
    width: 300,
    height: 200,
    resizeMode: 'cover',
    marginVertical: 10,
  },
  address: {
    fontSize: 16,
    color: '#CFB523',
    textAlign: 'center',
  },
  eventsTitle: {
    color: '#303030',
    backgroundColor: '#CFB523',
    textAlign: 'center',
    fontSize: 24,
    padding: 8,
    borderRadius: 8,
    marginVertical: 10,
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  eventContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  eventName: {
    fontSize: 18,
    color: 'white',
    textAlign: 'left',
    flex: 1,
    paddingRight: 10,
  },
  eventDate: {
    fontSize: 16,
    color: '#CFB523',
    textAlign: 'right',
  },
  noEventsText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    marginVertical: 20,
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

export default BarsEventsIndex;
