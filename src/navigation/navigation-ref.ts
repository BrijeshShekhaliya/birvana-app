import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

// We type the ref with RootStackParamList because it's attached to the root NavigationContainer
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
