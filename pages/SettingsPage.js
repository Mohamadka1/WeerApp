import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
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

  useEffect(() => {
    if (useCurrentLocation) {
      fetchCurrentLocation();
    }
  }, [useCurrentLocation]);

  const loadSettings = async () => {
    try {
      const loc = await AsyncStorage.getItem('defaultLocation');
      const unit = await AsyncStorage.getItem('isFahrenheit');
      const useCur = await AsyncStorage.getItem('useCurrentLocation');
      if (loc) setDefaultLocation(loc);
      if (unit != null) setIsFahrenheit(JSON.parse(unit));
      if (useCur != null) setUseCurrentLocation(JSON.parse(useCur));
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('defaultLocation', defaultLocation);
      await AsyncStorage.setItem('isFahrenheit', JSON.stringify(isFahrenheit));
      await AsyncStorage.setItem('useCurrentLocation', JSON.stringify(useCurrentLocation));
      Alert.alert('Instellingen opgeslagen', 'Je instellingen zijn bijgewerkt.');
      navigation.navigate('Weather');
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  };

  const fetchCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Toestemming geweigerd', 'Schakel locatietoegang in.');
      return;
    }
    try {
      let loc = await Location.getCurrentPositionAsync({});
      const places = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (places.length) {
        const p = places[0];
        setCurrentLocation(`${p.city}, ${p.country}`);
      }
    } catch (e) {
      console.error('Error fetching current location:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Instellingen</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Gebruik huidige locatie</Text>
        <Switch
          value={useCurrentLocation}
          onValueChange={setUseCurrentLocation}
        />
      </View>

      {useCurrentLocation && currentLocation !== '' && (
        <View style={styles.section}>
          <Text style={styles.label}>Huidige locatie</Text>
          <Text style={styles.locationText}>{currentLocation}</Text>
        </View>
      )}

      {!useCurrentLocation && (
        <View style={styles.section}>
          <Text style={styles.label}>Standaard locatie</Text>
          <TextInput
            style={styles.input}
            placeholder="Bijv. Amsterdam, NL"
            value={defaultLocation}
            onChangeText={setDefaultLocation}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Temperatuureenheid</Text>
        <View style={styles.unitToggle}>
          <Text style={styles.unitLabel}>°C</Text>
          <Switch
            value={isFahrenheit}
            onValueChange={setIsFahrenheit}
          />
          <Text style={styles.unitLabel}>°F</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={saveSettings}>
        <Text style={styles.buttonText}>Opslaan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FAFAFA',
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitLabel: {
    fontSize: 16,
    marginHorizontal: 8,
    color: '#333',
  },
  locationText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
});
