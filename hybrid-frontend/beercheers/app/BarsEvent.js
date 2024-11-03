import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BACKEND_URL } from '@env';

const BarsEvent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { barId, eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [bar, setBar] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('login');
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/users`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setCurrentUserId(data.current_user.id);
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchCurrentUserId();
  }, [navigation]);

  useEffect(() => {
    const fetchEventData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      try {
        const eventResponse = await fetch(`${BACKEND_URL}/api/v1/bars/${barId}/events/${eventId}`);
        const eventData = await eventResponse.json();
        setEvent(eventData.event);
        setBar(eventData.bar);

        const attendeesResponse = await fetch(`${BACKEND_URL}/api/v1/events/${eventId}/attendees`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const attendeesData = await attendeesResponse.json();
        setAttendees(attendeesData);
      } catch (error) {
        console.error('Error fetching event or bar data', error);
      }
    };

    if (currentUserId) fetchEventData();
  }, [eventId, barId, currentUserId]);

  const handleCheckIn = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events/${eventId}/attendance`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsCheckedIn(true);
        Alert.alert('Confirmed', 'You have confirmed your attendance.');
        fetchAttendees();
      } else {
        Alert.alert('Error', 'Error checking in.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error checking in.');
      console.error('Error checking in', error);
    }
  };

  const handleCancelAttendance = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events/${eventId}/attendance`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsCheckedIn(false);
        fetchAttendees();
      } else {
        Alert.alert('Error', 'Error canceling attendance.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error canceling attendance.');
      console.error('Error canceling attendance', error);
    }
  };

  const fetchAttendees = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events/${eventId}/attendees`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const attendeesData = await response.json();
      setAttendees(attendeesData);
    } catch (error) {
      console.error('Error fetching attendees', error);
    }
  };

  const renderAttendee = ({ item }) => (
    <View style={styles.attendeeContainer}>
      <Text style={styles.attendeeName}>
        {`${item.first_name} ${item.last_name}`}
      </Text>
      <Text style={[styles.attendeeHandle, { color: item.is_friend ? 'lightgreen' : '#CFB523' }]}>
        @{item.handle} {item.is_friend && '(FRIEND)'}
      </Text>
    </View>
  );

  const handleNavigateBack = () => {
    navigation.goBack();
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

      {bar && <Text style={styles.barName}>{bar.name}</Text>}

      {event && (
        <>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>

          <View style={styles.actionButtons}>
            {isCheckedIn ? (
              <View style={styles.confirmedContainer}>
                <Text style={styles.confirmedText}>Confirmed</Text>
                <TouchableOpacity onPress={handleCancelAttendance}>
                  <MaterialIcons name="clear" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ) : (
              <Button
                title="Check In"
                onPress={handleCheckIn}
                color="#CFB523"
              />
            )}
          </View>

          <Text style={styles.dateText}>
            Date: {new Date(event.date).toLocaleDateString()}
          </Text>

          <View style={styles.dateContainer}>
            <Text style={styles.startDateText}>
              Start date: {new Date(event.start_date).toLocaleDateString()}
            </Text>
            <Text style={styles.endDateText}>
              End date: {new Date(event.end_date).toLocaleDateString()}
            </Text>
          </View>

          <Text style={styles.attendeesTitle}>Attendees:</Text>
          <FlatList
            data={attendees}
            renderItem={renderAttendee}
            keyExtractor={(item) => item.id.toString()}
            style={styles.attendeeList}
          />
        </>
      )}

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
    padding: 20,
    backgroundColor: '#282c34',
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
  barName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  eventName: {
    fontSize: 20,
    marginVertical: 10,
    color: '#FFFFFF',
  },
  eventDescription: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  actionButtons: {
    marginVertical: 20,
    alignItems: 'center',
  },
  confirmedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmedText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 10,
  },
  attendeesTitle: {
    fontSize: 18,
    marginTop: 20,
    color: '#FFFFFF',
  },
  attendeeList: {
    marginTop: 10,
  },
  attendeeContainer: {
    backgroundColor: '#333',
    marginBottom: 10,
    borderRadius: 5,
    padding: 10,
  },
  attendeeName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  attendeeHandle: {
    fontSize: 14,
    color: '#FFFFFF',
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
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginVertical: 10,
  },
  dateContainer: {
    marginVertical: 10,
  },
  startDateText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  endDateText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default BarsEvent;