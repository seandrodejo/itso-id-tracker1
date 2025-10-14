import React, { createContext, useContext, useRef, ReactNode } from 'react';

interface NavigationTransitionContextType {
  // -1 = from left to right, 1 = from right to left, 0 = no transition
  transitionDirection: React.MutableRefObject<number>;
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
  // Stores only the direction for the next transition
  const transitionDirection = useRef(0);

  const navigateWithTransition = (targetRoute: string, currentRoute: string) => {
    const currentIndex = NAVIGATION_ORDER[currentRoute as keyof typeof NAVIGATION_ORDER] ?? 0;
    const targetIndex = NAVIGATION_ORDER[targetRoute as keyof typeof NAVIGATION_ORDER] ?? 0;
    
    // Determine transition direction
    // If moving to a higher index (right in navigation), slide from right to left
    // If moving to a lower index (left in navigation), slide from left to right
    const isMovingRight = targetIndex > currentIndex;
    const isMovingLeft = targetIndex < currentIndex;
    
    transitionDirection.current = isMovingRight ? 1 : isMovingLeft ? -1 : 0;
  };

  const contextValue: NavigationTransitionContextType = {
    transitionDirection,
    navigateWithTransition,
  };

  return (
    <NavigationTransitionContext.Provider value={contextValue}>
      {children}
    </NavigationTransitionContext.Provider>
  );
};
