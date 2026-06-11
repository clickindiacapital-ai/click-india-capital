import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import AssetLockerScreen from '../screens/AssetLockerScreen';

// Temporary placeholder screens for tabs we haven't built yet
const ApplyScreen = () => <Text style={{ marginTop: 50, textAlign: 'center' }}>Loan Application Hub</Text>;
const ProfileScreen = () => <Text style={{ marginTop: 50, textAlign: 'center' }}>User Profile & Settings</Text>;

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            paddingBottom: 5,
            paddingTop: 5,
          },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Dashboard' }} 
        />
        <Tab.Screen 
          name="Apply" 
          component={ApplyScreen} 
          options={{ title: 'New Loan' }} 
        />
        <Tab.Screen 
          name="Assets" 
          component={AssetLockerScreen} 
          options={{ title: 'Locker' }} 
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'Profile' }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
