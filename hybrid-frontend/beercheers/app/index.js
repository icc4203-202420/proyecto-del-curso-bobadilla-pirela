import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const Home = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/bars')}
      >
        <Image
          source={require('../assets/baricon_gray.png')}
          style={styles.image}
        />
        <Text style={styles.text}>Bars</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/beers')}
      >
        <Image
          source={require('../assets/searchgray.png')}
          style={styles.image}
        />
        <Text style={styles.text}>Search</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/bars-index-map')}
      >
        <Icon name="ios-map" size={100} color="#E3E5AF" />
        <Text style={styles.text}>Map</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/search-users')}
      >
        <Icon name="person" size={100} color="#E3E5AF" />
        <Text style={styles.text}>User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#303030',
    padding: 20,
  },
  card: {
    backgroundColor: '#303030',
    width: 300,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
    borderColor: '#E3E5AF',
    borderWidth: 1,
  },
  text: {
    fontSize: 24,
    color: '#E3E5AF',
    marginTop: 10,
  },
  image: {
    width: 80,
    height: 80,
  },
});

export default Home;
