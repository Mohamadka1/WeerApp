import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function AboutPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Over deze App</Text>
      <Text style={styles.text}>WeerApp v1.0</Text>
      <Text style={styles.text}>Gemaakt door Mohamad Kalash</Text>
      <Image style={styles.logo} source={require('../assets/logo.png')} />
      <Text style={styles.text}>© 2025 Mohamad Kalash. Alle rechten voorbehouden.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
});
