import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import HomeScreen from '@/screens/HomeScreen';
import SearchScreen from '@/screens/SearchScreen';
import LibraryScreen from '@/screens/LibraryScreen';
import { useTokens } from '@/theme/useTokens';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, isFocused, color }: { name: any, isFocused: boolean, color: string }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isFocused ? 1.2 : 1.0, { mass: 0.5, damping: 12, stiffness: 150 }) }
      ]
    };
  }, [isFocused]);

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={24} color={color} />
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors, radius } = useTokens();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : 20;

  return (
    <View style={[
      styles.tabBarContainer,
      { 
        bottom: bottomInset,
        backgroundColor: 'rgba(20, 20, 20, 0.85)', // Semi-transparent dark
        borderColor: colors.borderSubtle,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
      }
    ]}>
      {state.routes.map((route, index) => {
        const options = descriptors[route.key]?.options || {} as any;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName = 'home-outline';
        if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
        if (route.name === 'Search') iconName = isFocused ? 'search' : 'search-outline';
        if (route.name === 'Library') iconName = isFocused ? 'library' : 'library-outline';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            <View style={[styles.iconWrapper]}>
              <TabBarIcon 
                name={iconName} 
                isFocused={isFocused} 
                color={isFocused ? colors.primaryAccent : colors.textMuted} 
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const BottomTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default BottomTabs;
