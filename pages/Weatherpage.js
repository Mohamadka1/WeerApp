import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from 'react-native-vector-icons';

const API_KEY = '09530c25e17cfe2cbdd923bad8aea322';
const beaufortThresholds = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7, Infinity];

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [defaultLocation, setDefaultLocation] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => { ScreenOrientation.unlockAsync(); }, []);
  useEffect(() => {
    const onChange = ({ window: { width, height } }) => setIsLandscape(width > height);
    onChange({ window: Dimensions.get('window') });
    const sub = Dimensions.addEventListener('change', onChange);
    return () => sub?.remove ? sub.remove() : Dimensions.removeEventListener('change', onChange);
  }, []);
  useEffect(() => { if (isFocused) loadSettings(); }, [isFocused]);
  useEffect(() => { if (isFocused) fetchWeatherData(); }, [isFocused, useCurrentLocation, defaultLocation]);

  const loadSettings = async () => {
    try {
      const loc = await AsyncStorage.getItem('defaultLocation');
      const unit = await AsyncStorage.getItem('isFahrenheit');
      const useCur = await AsyncStorage.getItem('useCurrentLocation');
      if (loc) setDefaultLocation(loc);
      if (unit != null) setIsFahrenheit(JSON.parse(unit));
      if (useCur != null) setUseCurrentLocation(JSON.parse(useCur));
    } catch (e) { console.error(e); }
  };

  const fetchWeatherData = async () => {
    if (useCurrentLocation) await getCurrentLocationWeather();
    else await fetchWeatherByCity(defaultLocation);
  };

  const getCurrentLocationWeather = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Locatietoegang geweigerd');
      setWeatherData(null);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    await fetchWeather(loc.coords.latitude, loc.coords.longitude);
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await resp.json();
      if (!resp.ok || !data.main) {
        setErrorMsg(data.message || 'Fout ophalen weer');
        setWeatherData(null);
      } else {
        setErrorMsg(null);
        setWeatherData(data);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Fout ophalen weer');
      setWeatherData(null);
    }
  };

  const fetchWeatherByCity = async (city) => {
    if (!city?.trim()) {
      setErrorMsg('Voer stad in of gebruik huidige locatie');
      setWeatherData(null);
      return;
    }
    try {
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=metric`
      );
      const data = await resp.json();
      if (!resp.ok || !data.main) {
        setErrorMsg(data.message || 'Onbekende locatie');
        setWeatherData(null);
      } else {
        setErrorMsg(null);
        setWeatherData(data);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Fout ophalen weer');
      setWeatherData(null);
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{errorMsg}</Text>
      </View>
    );
  }
  if (!weatherData?.main) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const tempC = Math.round(weatherData.main.temp);
  const temp = isFahrenheit ? Math.round((tempC * 9) / 5 + 32) : tempC;
  const unit = isFahrenheit ? '°F' : '°C';
  const windMs = weatherData.wind.speed;
  const windKmh = (windMs * 3.6).toFixed(1);
  const windKnots = (windMs * 1.94384).toFixed(1);
  const beaufort = beaufortThresholds.findIndex((t) => windMs <= t);
  const windDeg = weatherData.wind.deg;

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      <View style={[styles.card, isLandscape && styles.cardLandscape]}>
        <View style={[styles.section, isLandscape && styles.sectionLandscape]}>
          <Image
            style={styles.icon}
            source={{
              uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`,
            }}
          />
          <Text style={styles.temp}>
            {temp}
            {unit}
          </Text>
          <Text style={styles.header}>{weatherData.name}</Text>
        </View>
        <View style={[styles.details, isLandscape && styles.detailsLandscape]}>
          <View style={styles.detailBlock}>
            <Ionicons
              name="arrow-up"
              size={40}
              style={{
                transform: [{ rotate: `${windDeg}deg` }],
                marginBottom: 4,
              }}
            />
            <Text style={styles.detailText}>Windrt: {windDeg}°</Text>
            <Text style={styles.detailText}>{windMs.toFixed(1)} m/s</Text>
            <Text style={styles.detailText}>
              {windKmh} km/h ({windKnots} kn)
            </Text>
            <Text style={styles.detailText}>Beaufort {beaufort}</Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.detailText}>Luchtdruk</Text>
            <Text style={styles.detailText}>
              {weatherData.main.pressure} hPa
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: {
    flex: 1,
    backgroundColor: '#E8F0F8',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerLandscape: { flexDirection: 'row' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  cardLandscape: { flexDirection: 'row', width: '95%', padding: 24 },
  section: { alignItems: 'center', marginBottom: 12 },
  sectionLandscape: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { width: 100, height: 100 },
  temp: {
    fontSize: 48,
    fontWeight: '700',
    color: '#007AFF',
    marginVertical: 8,
  },
  header: { fontSize: 20, fontWeight: '600', color: '#333' },
  details: {},
  detailsLandscape: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 16,
  },
  detailBlock: { alignItems: 'center', marginHorizontal: 8 },
  detailText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 2,
  },
  error: { color: 'red', fontSize: 16 },
});
