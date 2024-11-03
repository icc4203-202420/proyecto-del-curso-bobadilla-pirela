import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';

const BarsIndex = () => {
  const [bars, setBars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/bars`);
        const data = await response.json();
        setBars(data.bars || []);
      } catch (error) {
        console.error("No se pudieron capturar los bars!", error);
      }
    };

    fetchBars();

    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    navigation.navigate('index');
  };

  const handleLogin = () => {
    navigation.navigate('login');
  };

  const filteredBars = bars.filter(bar =>
    bar.name.toLowerCase().includes(searchTerm.toLowerCase())
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

      <Text style={styles.title}>
        Find your{'\n'}
        favorite bar
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#787878"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <FlatList
        data={filteredBars}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate('BarEvents', { barId: item.id })}
          >
            <View style={styles.textContainer}>
              <Text style={styles.barName}>{item.name}</Text>
              {item.address && (
                <Text style={styles.address}>
                  {item.address.line1} {item.address.line2 && `, ${item.address.line2}`}{'\n'}
                  {item.address.city}{item.address.country && `, ${item.address.country}`}
                </Text>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 10,
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
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 50,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 3,
    marginVertical: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#606060',
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#404040',
    borderRadius: 8,
    marginVertical: 5,
    width: '100%',
  },
  textContainer: {
    flex: 1,
  },
  barName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  address: {
    color: '#CFB523',
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
});

export default BarsIndex;
