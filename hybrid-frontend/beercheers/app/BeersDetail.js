import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Pressable, FlatList } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '@env';

const BeersDetail = () => {
  const [beer, setBeer] = useState(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { id } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/v1/beers/${id}`)
      .then(response => {
        setBeer(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching beer details:', error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#CFB523" />
      </View>
    );
  }

  if (!beer) {
    return <Text style={styles.errorText}>Beer not found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>

      <Image source={require('../assets/icon_beercheers.png')} style={styles.icon} />
      <Text style={styles.title}>{beer.name}</Text>

      <View style={styles.detailContainer}>
        <Text style={styles.detailText}>Type: {beer.beer_type}</Text>
        <Text style={styles.detailText}>Name: {beer.name}</Text>
        <Text style={styles.detailText}>Hop: {beer.hop}</Text>
        <Text style={styles.detailText}>Malts: {beer.malts}</Text>
        <Text style={styles.detailText}>Alcohol: {beer.alcohol}%</Text>
        <Text style={styles.detailText}>Brand: {beer.brand?.name || 'N/A'}</Text>
        <Text style={styles.detailText}>Brewery: {beer.brand?.brewery?.name || 'N/A'}</Text>
        <Text style={styles.detailText}>Style: {beer.style || 'N/A'}</Text>
        <Text style={styles.detailText}>Yeast: {beer.yeast || 'N/A'}</Text>
        <Text style={styles.detailText}>IBU: {beer.ibu}</Text>
        <Text style={styles.detailText}>BLG: {beer.blg}</Text>
      </View>

      <View style={styles.barsContainer}>
        <Text style={styles.barsTitle}>Bars Serving This Beer:</Text>
        {beer.bars && beer.bars.length > 0 ? (
          <FlatList
            data={beer.bars}
            keyExtractor={(bar) => bar.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.barItem}>
                <Text style={styles.barName}>{item.name}</Text>
                <Text style={styles.barAddress}>
                  {item.address ? `${item.address.street}, ${item.address.city}, ${item.address.country.name}` : 'N/A'}
                </Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.detailText}>No bars serving this beer.</Text>
        )}
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingTitle}>Rating:</Text>
        <Text style={styles.ratingValue}>
          {beer.avg_rating ? beer.avg_rating.toFixed(2) : 'N/A'}
        </Text>
      </View>

      <Pressable style={styles.button} onPress={() => navigation.navigate('AddRating', { id })}>
        <Text style={styles.buttonText}>ADD RATING</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => navigation.navigate('AllReviews', { id })}>
        <Text style={styles.buttonText}>ALL REVIEWS</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#303030',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#303030',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#CFB523',
    fontSize: 18,
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailContainer: {
    marginVertical: 16,
  },
  detailText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  ratingContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  ratingTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingValue: {
    color: '#CFB523',
    fontSize: 24,
    fontWeight: 'bold',
  },
  barsContainer: {
    marginVertical: 16,
  },
  barsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  barItem: {
    backgroundColor: '#404040',
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
  },
  barName: {
    color: '#CFB523',
    fontSize: 16,
  },
  barAddress: {
    color: 'white',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#CFB523',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BeersDetail;
