# Navigation Transitions

This document describes the navigation transition system implemented in the mobile app.

## Overview

The app now includes smooth screen transitions that move from right-to-left or left-to-right depending on the navigation direction. This provides a more intuitive and polished user experience.

## Navigation Order

The screens are ordered as follows:
1. Dashboard (index: 0)
2. Announcements (index: 1) 
3. Calendar (index: 2)
4. Profile (index: 3)

## Transition Logic

- **Moving Right**: When navigating to a screen with a higher index, the new screen slides in from the left (left-to-right transition)
- **Moving Left**: When navigating to a screen with a lower index, the new screen slides in from the right (right-to-left transition)
- **Same Screen**: No transition animation is applied

## Examples

- Dashboard → Announcements: Slides left-to-right (new screen comes from left)
- Announcements → Dashboard: Slides right-to-left (new screen comes from right)
- Calendar → Profile: Slides left-to-right (new screen comes from left)
- Profile → Calendar: Slides right-to-left (new screen comes from right)

## Implementation Details

### Components

1. **NavigationTransitionContext** (`contexts/NavigationTransitionContext.tsx`)
   - Manages the shared animation state
   - Provides `navigateWithTransition` function
   - Defines navigation order and transition directions

2. **AnimatedScreen** (`components/AnimatedScreen.tsx`)
   - Wrapper component that applies transitions to screens
   - Uses react-native-reanimated for smooth animations
   - Handles opacity and translateX animations

3. **useNavigationWithTransition** (`hooks/useNavigationWithTransition.ts`)
   - Custom hook that provides typed navigation functions
   - Integrates with the transition context
   - Replaces direct router.push calls

### Usage

Each screen is now wrapped with `AnimatedScreen` and uses the `useNavigationWithTransition` hook:

```tsx
import { useNavigationWithTransition } from "../hooks/useNavigationTransition";
import { AnimatedScreen } from '../components/AnimatedScreen';

export default function Dashboard() {
  const { navigateToPage, currentRoute } = useNavigationWithTransition();
  
  return (
    <AnimatedScreen route="/dashboard" currentRoute={currentRoute}>
      {/* Screen content */}
    </AnimatedScreen>
  );
}
```

### Animation Details

- **Duration**: 300ms
- **Easing**: Easing.out(Easing.cubic) for smooth deceleration
- **Properties**: translateX only (clean slide animation)
- **Slide distance**: 100% screen width
- **Immediate navigation**: No delays - instant page switching with smooth slide transitions

## Testing

To test the transitions:

1. Navigate between different screens using the bottom navigation
2. Observe the directional transitions:
   - Dashboard → Announcements: Left-to-right
   - Announcements → Calendar: Left-to-right  
   - Calendar → Profile: Left-to-right
   - Profile → Calendar: Right-to-left
   - Calendar → Announcements: Right-to-left
   - Announcements → Dashboard: Right-to-left

The transitions should feel smooth and natural, providing visual feedback about the navigation direction.
