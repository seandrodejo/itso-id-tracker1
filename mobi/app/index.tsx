import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
  import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    // Navigate to login screen after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);

    return () => {
      spinAnimation.stop();
      clearTimeout(timer);
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* ITSO Logo */}
        <Image
          source={require('../assets/images/ITSOlogo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        
        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>NU Damarinas</Text>
          <Text style={styles.subtitle}>ITSO ID Tracker</Text>
        </View>
      </View>

      {/* Loading Circle Animation */}
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingCircle, { transform: [{ rotate: spin }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2849D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 100,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 20,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 25,
    fontWeight: '800',
    color: 'white',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 12,
    borderColor: '#FFD147',
    borderTopColor: 'transparent',
    borderEndWidth: 12,
    borderStartWidth: 12,

  },
});
