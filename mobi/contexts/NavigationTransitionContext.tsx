import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { Animated, Easing } from 'react-native';

interface NavigationTransitionContextType {
  slideAnimation: Animated.Value;
  navigateWithTransition: (targetRoute: string, currentRoute: string) => void;
}

const NavigationTransitionContext = createContext<NavigationTransitionContextType | undefined>(undefined);

export const useNavigationTransition = () => {
  const context = useContext(NavigationTransitionContext);
  if (!context) {
    throw new Error('useNavigationTransition must be used within a NavigationTransitionProvider');
  }
  return context;
};

interface NavigationTransitionProviderProps {
  children: ReactNode;
}

// Define the navigation order for transition direction logic
const NAVIGATION_ORDER = {
  '/dashboard': 0,
  '/announcements': 1,
  '/calendar': 2,
  '/profile': 3,
};

export const NavigationTransitionProvider: React.FC<NavigationTransitionProviderProps> = ({ children }) => {
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const navigateWithTransition = (targetRoute: string, currentRoute: string) => {
    const currentIndex = NAVIGATION_ORDER[currentRoute as keyof typeof NAVIGATION_ORDER] ?? 0;
    const targetIndex = NAVIGATION_ORDER[targetRoute as keyof typeof NAVIGATION_ORDER] ?? 0;
    
    // Determine transition direction
    // If moving to a higher index (right in navigation), slide from right to left
    // If moving to a lower index (left in navigation), slide from left to right
    const isMovingRight = targetIndex > currentIndex;
    const isMovingLeft = targetIndex < currentIndex;
    
    if (isMovingRight) {
      // Moving right: new screen comes from right (translateX: 100% to 0%)
      slideAnimation.setValue(100);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (isMovingLeft) {
      // Moving left: new screen comes from left (translateX: -100% to 0%)
      slideAnimation.setValue(-100);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      // Same screen or unknown route, no transition
      slideAnimation.setValue(0);
    }
  };

  const contextValue: NavigationTransitionContextType = {
    slideAnimation,
    navigateWithTransition,
  };

  return (
    <NavigationTransitionContext.Provider value={contextValue}>
      {children}
    </NavigationTransitionContext.Provider>
  );
};
