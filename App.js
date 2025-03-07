import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from 'react-native-vector-icons';

import WeatherPage from './pages/Weatherpage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Weather"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Weather') {
              iconName = 'partly-sunny';
            } else if (route.name === 'Settings') {
              iconName = 'settings';
            } else if (route.name === 'About') {
              iconName = 'information-circle';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false, 
        })}
      >
        <Tab.Screen name="Weather" component={WeatherPage} />
        <Tab.Screen name="Settings" component={SettingsPage} />
        <Tab.Screen name="About" component={AboutPage} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
