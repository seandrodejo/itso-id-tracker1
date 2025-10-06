import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const nuidAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Slide up animation for swipe indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(swipeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(swipeAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation for NUID image
    Animated.loop(
      Animated.sequence([
        Animated.timing(nuidAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(nuidAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleContinue = () => {
    router.replace('/login');
  };

  const swipeIndicatorTranslateY = swipeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const swipeIndicatorOpacity = swipeAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const nuidTranslateY = nuidAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const nuidRotate = nuidAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '5deg', '0deg'],
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1}
      onPress={handleContinue}
    >
      {/* Background Image */}
      <Image
        source={require('../assets/images/splash.png')}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* NU Logo */}
        <Image
          source={require('../assets/images/nu-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        
        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>NU Dasmarinas</Text>
          <Text style={styles.subtitle}>ITSO ID Tracker</Text>
        </View>
      </Animated.View>

      {/* Animated NUID Image */}
      <Animated.View 
        style={[
          styles.nuidContainer,
          {
            transform: [
              { translateY: nuidTranslateY },
              { rotate: nuidRotate }
            ],
            opacity: fadeAnim,
          }
        ]}
      >
        <Image
          source={require('../assets/images/NUID.png')}
          style={styles.nuidImage}
          contentFit="contain"
        />
      </Animated.View>

      {/* Swipe Up Indicator */}
      <Animated.View 
        style={[
          styles.swipeContainer,
          {
            transform: [{ translateY: swipeIndicatorTranslateY }],
            opacity: swipeIndicatorOpacity,
          }
        ]}
      >
        <Ionicons name="chevron-up" size={24} color="#ffffff" />
        <Text style={styles.swipeText}>Tap to continue</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 260,
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 5,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2849D0',
    letterSpacing: 1,

  },
  subtitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2849D0',
    letterSpacing: 0.5,
  },
  swipeContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeText: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 8,
    fontWeight: '500',
    opacity: 0.8,
  },
  nuidContainer: {
    position: 'absolute',
    bottom: 100,
    left: -70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nuidImage: {
    width:350,
    height: 400,
  },
});
