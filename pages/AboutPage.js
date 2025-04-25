import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';

export default function AboutPage() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          style={styles.logo}
          source={require('../assets/logo.png')}
          resizeMode="contain"
        />
        <Text style={styles.title}>WeerApp</Text>
        <Text style={styles.version}>v1.0</Text>
        <Text style={styles.text}>Gemaakt door Mohamad Kalash</Text>
        <Text style={styles.text}>© 2025 Mohamad Kalash</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: 300,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  version: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
});
