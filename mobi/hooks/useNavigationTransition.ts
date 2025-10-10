import { useRouter, usePathname } from 'expo-router';
import { useNavigationTransition } from '../contexts/NavigationTransitionContext';

type Route = '/dashboard' | '/announcements' | '/calendar' | '/profile' | '/login';

export const useNavigationWithTransition = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { navigateWithTransition } = useNavigationTransition();

  const navigateToPage = (targetRoute: Route) => {
    const currentRoute = (pathname as Route) || '/dashboard';
    
    // Only navigate if we're going to a different route
    if (targetRoute !== currentRoute) {
      // Navigate immediately
      router.push(targetRoute as any);
      
      // Trigger the transition animation after navigation
      navigateWithTransition(targetRoute, currentRoute);
    }
  };

  return {
    navigateToPage,
    currentRoute: pathname,
  };
};
