import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const nuidAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isNavigating = useRef(false);

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
    if (isNavigating.current) return;
    isNavigating.current = true;

    // Start exit animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -height,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate after animation completes
      router.push('/login');
    });
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
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.touchableContainer} 
        activeOpacity={1}
        onPress={handleContinue}
      >
      {/* Background Image */}
      <Image
        source={require('../assets/images/splash.png')}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      
      <View style={styles.content}>
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
      </View>

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
        <Text style={styles.swipeText}>Swipe up to continue</Text>
      </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableContainer: {
    flex: 1,
    width: '100%',
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
    marginTop: 220,
  },
  logo: {
    width: 75,
    height: 75,
    marginRight: 10,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 25,
    fontWeight: '900',
    color: '#2849D0',
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'Arial-Black',
      android: 'sans-serif-black',
      default: 'Arial-Black',
    }),
  },
  subtitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#2849D0',
    letterSpacing: 0.2,
    fontFamily: Platform.select({
      ios: 'Arial-Black',
      android: 'sans-serif-black',
      default: 'Arial-Black',
    }),
  },
  swipeContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  swipeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 8,
    opacity: 0.8,
    fontFamily: 'Montserrat',
  },
  nuidContainer: {
    position: 'absolute',
    bottom: 110,
    right: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nuidImage: {
    width: 400,
    height: 400,
  },
});
