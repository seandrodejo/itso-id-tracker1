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
      // Set direction BEFORE navigating so the next screen can animate in correctly
      navigateWithTransition(targetRoute, currentRoute);
      // Navigate immediately after direction is set
      router.push(targetRoute as any);
    }
  };

  return {
    navigateToPage,
    currentRoute: pathname,
  };
};
