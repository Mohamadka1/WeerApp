import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Switch, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export default function SettingsPage({ navigation }) {
  const [defaultLocation, setDefaultLocation] = useState('');
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');

  useEffect(() => {
    loadSettings();
    fetchCurrentLocation();
  }, []);

  const loadSettings = async () => {
    try {
      const location = await AsyncStorage.getItem('defaultLocation');
      const tempUnit = await AsyncStorage.getItem('isFahrenheit');
      const useCurrent = await AsyncStorage.getItem('useCurrentLocation');
      
      console.log('Loaded Settings:', { location, tempUnit, useCurrent }); 
  
      if (location) setDefaultLocation(location);
      if (tempUnit !== null) setIsFahrenheit(JSON.parse(tempUnit));
      if (useCurrent !== null) setUseCurrentLocation(JSON.parse(useCurrent));
    } catch (error) {
      console.error('Fout bij laden instellingen', error);
    }
  };
  

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('defaultLocation', defaultLocation);
      await AsyncStorage.setItem('isFahrenheit', JSON.stringify(isFahrenheit));
      await AsyncStorage.setItem('useCurrentLocation', JSON.stringify(useCurrentLocation));
  
      console.log('Saved Settings:', { defaultLocation, isFahrenheit, useCurrentLocation }); 
  
      Alert.alert('Instellingen opgeslagen!', 'De instellingen zijn succesvol opgeslagen.');
      navigation.navigate('Weather');
    } catch (error) {
      console.error('Fout bij opslaan instellingen', error);
    }
  };
  

  const fetchCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Toestemming geweigerd', 'Schakel locatietoegang in de instellingen in.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const coords = `${location.coords.latitude},${location.coords.longitude}`;

    try {
      const geoData = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geoData.length > 0) {
        const { street, city, country, region, name } = geoData[0];
        
        let readableAddress = '';
        if (street) {
          readableAddress += street + ', ';
        }
        if (city) {
          readableAddress += city + ', ';
        }
        if (region) {
          readableAddress += region + ', ';
        }
        if (country) {
          readableAddress += country;
        }
        setCurrentLocation(readableAddress || 'Locatie niet gevonden');
      } else {
        setCurrentLocation('Locatie niet gevonden');
      }
    } catch (error) {
      console.error('Fout bij reverse geocoding', error);
      setCurrentLocation('Fout bij het ophalen van locatie');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Instellingen</Text>

      <Text style={styles.defaultLocationText}>Huidige locatie: {currentLocation || 'Niet opgehaald'}</Text>

      <View style={styles.switchContainer}>
        <Text>Gebruik huidige locatie:</Text>
        <Switch value={useCurrentLocation} onValueChange={setUseCurrentLocation} />
      </View>

      {!useCurrentLocation && (
        <>
          <Text>Standaard locatie (stad, land):</Text>
          <TextInput
            style={styles.input}
            value={defaultLocation}
            onChangeText={setDefaultLocation}
            placeholder="Bijv. Amsterdam, NL"
          />
        </>
      )}
      <View style={styles.switchContainer}>
          <Text>Gebruik Fahrenheit:</Text>
          <Switch value={isFahrenheit} onValueChange={setIsFahrenheit} />
      </View>

      <Button title="Opslaan" onPress={saveSettings} backgroundColor="#007AFF" />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  defaultLocationText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
