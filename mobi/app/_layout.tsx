import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../contexts/AuthContext';
import { NavigationTransitionProvider } from '../contexts/NavigationTransitionContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Montserrat': require('../assets/fonts/montserrat.black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      console.log('Fonts loaded successfully:', fontsLoaded);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    console.log('Fonts not loaded yet...');
    return null;
  }
  
  return (
    <AuthProvider>
      <NavigationTransitionProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Loading' }} />
          <Stack.Screen name="splash" options={{ title: 'Splash' }} />
          <Stack.Screen name="login" options={{ title: 'Login' }} />
          <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
          <Stack.Screen name="announcements" options={{ title: 'Announcements' }} />
          <Stack.Screen name="calendar" options={{ title: 'Calendar' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        </Stack>
        <StatusBar style="light" />
      </NavigationTransitionProvider>
    </AuthProvider>
  );
}
