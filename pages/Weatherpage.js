import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = '09530c25e17cfe2cbdd923bad8aea322';

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [defaultLocation, setDefaultLocation] = useState('');

  useEffect(() => {
    const loadAndFetch = async () => {
       loadSettings();
      fetchWeatherData();
    };
  
    loadAndFetch();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('defaultLocation');
      const savedTempUnit = await AsyncStorage.getItem('isFahrenheit');
      const savedUseCurrentLocation = await AsyncStorage.getItem('useCurrentLocation');

      if (savedLocation) setDefaultLocation(savedLocation);
      if (savedTempUnit !== null) setIsFahrenheit(JSON.parse(savedTempUnit));
      if (savedUseCurrentLocation !== null) setUseCurrentLocation(JSON.parse(savedUseCurrentLocation));
    } catch (error) {
      console.error('Fout bij laden instellingen', error);
    }
  };

  const fetchWeatherData = async () => {
    console.log('Using current location:', useCurrentLocation);
    if (useCurrentLocation) {
      await getCurrentLocationWeather();
    } else {
      await fetchWeatherByCity(defaultLocation);
    }
  };
  

  const getCurrentLocationWeather = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Toestemming voor locatie is geweigerd');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    fetchWeather(location.coords.latitude, location.coords.longitude);
  };

const fetchWeather = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    console.log('Weather API response:', data); 
    setWeatherData(data);
  } catch (error) {
    setErrorMsg('Fout bij het ophalen van weerdata');
  }
};

const fetchWeatherByCity = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    console.log('Weather API response:', data);
    setWeatherData(data);
  } catch (error) {
    setErrorMsg('Fout bij het ophalen van weerdata voor stad');
  }
};

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const temperature = weatherData.main ? (
    isFahrenheit
      ? Math.round((weatherData.main.temp * 9) / 5 + 32)
      : Math.round(weatherData.main.temp)
  ) : null;

  const temperatureUnit = isFahrenheit ? '°F' : '°C';

  return (
    <View style={[styles.container, isLandscape ? styles.landscapeContainer : null]}>
      <Text style={styles.title}>Weer op uw locatie</Text>
      {temperature !== null ? (
        <>
          <Text style={styles.temperature}>
            {temperature} {temperatureUnit}
          </Text>
          <Text>Wind: {weatherData.wind.speed} m/s</Text>
          <Text>Luchtdruk: {weatherData.main.pressure} hPa</Text>
          <Image
            style={styles.weatherIcon}
            source={{
              uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
            }}
          />
        </>
      ) : (
        <Text>Geen temperatuurgegevens beschikbaar</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  landscapeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  temperature: {
    fontSize: 48,
    marginVertical: 10,
  },
  weatherIcon: {
    backgroundColor: 'gray',
    width: 100,
    height: 100,
  },
});
