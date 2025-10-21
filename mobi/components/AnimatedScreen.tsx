import React, { useEffect, ReactNode } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useNavigationTransition } from '../contexts/NavigationTransitionContext';

interface AnimatedScreenProps {
  children: ReactNode;
  route: string;
  currentRoute: string;
}

export const AnimatedScreen: React.FC<AnimatedScreenProps> = ({ children, route, currentRoute }) => {
  const { transitionDirection } = useNavigationTransition();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Check if this is the current route (just navigated to)
    if (currentRoute === route) {
      // Determine direction: 1 means from right, -1 means from left
      const dir = transitionDirection.current;
      const screenWidth = Dimensions.get('window').width;
      
      if (dir !== 0) {
        // Set initial position based on direction
        translateX.value = dir > 0 ? screenWidth : -screenWidth;
        opacity.value = 0;
        
        // Synchronized slide and fade animation - both use same duration and timing
        translateX.value = withTiming(0, {
          duration: 280,
          easing: Easing.out(Easing.cubic),
        });
        opacity.value = withTiming(1, {
          duration: 320,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        // No slide animation needed, just fade in
        translateX.value = 0;
        opacity.value = withTiming(1, {
          duration: 320,
          easing: Easing.out(Easing.cubic),
        });
      }
    } else {
      // This is not the current route, reset to initial state
      translateX.value = 0;
      opacity.value = 0;
    }
  }, [currentRoute, route, transitionDirection, translateX, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Ensure this container doesn't affect other elements
    position: 'relative',
    zIndex: 1,
  },
});
