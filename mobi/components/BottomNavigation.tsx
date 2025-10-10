import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigationWithTransition } from '../hooks/useNavigationTransition';

interface BottomNavigationProps {
  currentRoute: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentRoute }) => {
  const { navigateToPage } = useNavigationWithTransition();

  // This component should remain completely static with no animations

  const getIconColor = (route: string) => {
    return currentRoute === route ? '#1e40af' : '#475569';
  };

  const getIconName = (route: string, isActive: boolean) => {
    const iconMap = {
      '/dashboard': isActive ? 'home' : 'home-outline',
      '/announcements': isActive ? 'notifications' : 'notifications-outline',
      '/calendar': isActive ? 'calendar' : 'calendar-outline',
      '/profile': isActive ? 'person' : 'person-outline',
    };
    return iconMap[route as keyof typeof iconMap] || 'home-outline';
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={() => navigateToPage('/dashboard')}>
        <Ionicons 
          name={getIconName('/dashboard', currentRoute === '/dashboard') as any} 
          size={24} 
          color={getIconColor('/dashboard')} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToPage('/announcements')}>
        <Ionicons 
          name={getIconName('/announcements', currentRoute === '/announcements') as any} 
          size={24} 
          color={getIconColor('/announcements')} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToPage('/calendar')}>
        <Ionicons 
          name={getIconName('/calendar', currentRoute === '/calendar') as any} 
          size={24} 
          color={getIconColor('/calendar')} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToPage('/profile')}>
        <Ionicons 
          name={getIconName('/profile', currentRoute === '/profile') as any} 
          size={24} 
          color={getIconColor('/profile')} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Ensure no animations - completely static

    // Additional isolation properties
    pointerEvents: 'auto',
    overflow: 'visible',
  },
});
