import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';
import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const bars = () => {
  const [bars, setBars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();
	const router = useRouter();
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
    const fetchBars = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/bars`);
        const data = await response.json();
        setBars(data.bars || []);
      } catch (error) {
        console.error("No se pudieron capturar las bars!", error);
      }
    };

    fetchBars();
  }, []);

  const filteredBars = bars.filter(bar =>
    bar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const renderBar = ({ item }) => (
    <Link href={`/BarsEventsIndex?id=${item.id}`} style={styles.listItem}>
      <View style={styles.textContainer}>
        <Text style={styles.barName}>{item.name}</Text>
        {item.address && (
          <Text style={styles.barAddress}>
            {item.address.line1}
            {item.address.line2 ? `, ${item.address.line2}` : ''}
            {'\n'}
            {item.address.city}
            {item.address.country ? `, ${item.address.country}` : ''}
          </Text>
        )}
      </View>
    </Link>
  );

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={isLoggedIn ? handleLogout : handleLogin}
      >
        <Text style={styles.logoutButtonText}>{isLoggedIn ? 'Home' : 'Log In'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Find your{"\n"}favorite bar</Text>

      <TextInput
        placeholder="Name"
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.input}
        placeholderTextColor="#787878"
      />

      <FlatList
        data={filteredBars}
        renderItem={renderBar}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
    padding: 16,
  },
  text: {
    color: '#E3E5AF',
    fontSize: 24,
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  input: {
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    padding: 8,
    color: '#606060',
  },
  list: {
    marginTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#404040',
    borderRadius: 8,
    padding: 12,
  },
  textContainer: {
    flex: 1,
  },
  barName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  barAddress: {
    color: '#FFD700',
    fontSize: 14,
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

export default bars;
