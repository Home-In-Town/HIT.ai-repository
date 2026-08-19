import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeMapScreen from '../screens/home/HomeMapScreen';
import PropertyDetailScreen from '../screens/property/PropertyDetailScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={HomeMapScreen} />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
