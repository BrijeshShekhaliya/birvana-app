import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Home, Search, Library } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      {state.routes.map((route, index) => {
        const options = descriptors[route.key]?.options || {};
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const IconComponent = 
          route.name === 'HomeTab' ? Home : 
          route.name === 'SearchTab' ? Search : 
          Library;

        return (
          <TabBarButton 
            key={route.key} 
            isFocused={isFocused} 
            onPress={onPress} 
            Icon={IconComponent} 
            label={label as string} 
          />
        );
      })}
    </View>
  );
}

function TabBarButton({ isFocused, onPress, Icon, label }: any) {
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        scale: withSpring(isFocused ? 1.1 : 1.0, { damping: 15, stiffness: 150 })
      }]
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        scale: withSpring(isFocused ? 1.05 : 1.0, { damping: 15, stiffness: 150 })
      }]
    };
  });

  const color = isFocused ? '#00A8E1' : '#B3B3B3'; // Primary or TextSecondary

  return (
    <Pressable 
      onPress={onPress} 
      style={styles.button}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)', borderless: true }}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <Icon size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />
      </Animated.View>
      <Animated.Text style={[styles.label, { color }, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0F0F0F', // theme.background
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A', // theme.border
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  }
});
