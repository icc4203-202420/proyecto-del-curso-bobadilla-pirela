import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, FlatList, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { BACKEND_URL } from '@env';

const Beers = () => {
  const [beers, setBeers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBeers = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/beers`);
        const data = await response.json();
        setBeers(data.beers || []);
      } catch (error) {
        console.error("No se pudieron capturar las beers!", error);
      }
    };

    fetchBeers();
  }, []);

  const filteredBeers = beers.filter(beer =>
    beer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderBeer = ({ item }) => (
    <Link href={`/BeersDetail?id=${item.id}`} style={styles.listItem}>
      <View style={styles.textContainer}>
        <Text style={styles.beerName}>{item.name}</Text>
        <Text style={styles.beerStyle}>{item.style}</Text>
      </View>
    </Link>
  );

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />
      <Text style={styles.title}>Find your favorite beer</Text>

      <TextInput
        placeholder="Name"
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.input}
      />

      <FlatList
        data={filteredBeers}
        renderItem={renderBeer}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />
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
  beerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  beerStyle: {
    color: '#FFD700',
    fontSize: 14,
  },
});

export default Beers;