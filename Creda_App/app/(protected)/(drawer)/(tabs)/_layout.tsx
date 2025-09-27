import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { router, Tabs } from 'expo-router';
import {
  Home,
  LineChart,
  Banknote,
  Bell,
  ReceiptText,
  Plus,
  Mic,
} from 'lucide-react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAV_THEME } from '~/lib/constants';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';

// Updated colors for the new style
const ThemedColors = {
  light: {
    background: NAV_THEME.light.card,
    pill: NAV_THEME.light.primary,
    activeText: NAV_THEME.light.primary,
    inactiveText: 'hsl(240 5% 45%)',
    notification: NAV_THEME.light.notification,
    fabBackground: NAV_THEME.light.primary,
    fabIcon: '#ffffff',
    aura: NAV_THEME.light.primary,
  },
  dark: {
    background: NAV_THEME.dark.card,
    pill: NAV_THEME.dark.primary,
    activeText: NAV_THEME.dark.primary,
    inactiveText: 'hsl(240 10% 65%)',
    notification: NAV_THEME.dark.notification,
    fabBackground: NAV_THEME.dark.primary,
    fabIcon: '#000000',
    aura: NAV_THEME.dark.primary,
  },
};

// Animated Aura Ball Component
const AnimatedAuraButton = ({ onPress, colors }) => {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(0);
  const rotation = useSharedValue(0);
  const auraOpacity = useSharedValue(0.5);
  const auraScale = useSharedValue(1);

  // Pulsing animation for continuous aura effect
  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    auraOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );

    auraScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const auraStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      pulse.value,
      [0, 1],
      [1, 1.3],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: auraScale.value * scaleValue },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: auraOpacity.value,
    };
  });

  const innerAuraStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      pulse.value,
      [0, 1],
      [1, 1.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: auraScale.value * scaleValue * 0.8 },
        { rotate: `${-rotation.value * 0.7}deg` },
      ],
      opacity: auraOpacity.value * 0.6,
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    // Add a little bounce effect on press
    //

    scale.value = withSequence(
      withTiming(0.8, { duration: 50 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    // Trigger the actual press handler
    setTimeout(() => {
      onPress?.();
    }, 150);

    router.push('/voiceagent');
  };

  return (
    <View style={styles.auraContainer}>
      {/* Outer Aura */}
      <Animated.View
        style={[
          styles.aura,
          styles.outerAura,
          { backgroundColor: colors.aura },
          auraStyle
        ]}
      />

      {/* Inner Aura */}
      <Animated.View
        style={[
          styles.aura,
          styles.innerAura,
          { backgroundColor: colors.aura },
          innerAuraStyle
        ]}
      />

      {/* Main Button */}
      <Animated.View style={[styles.fab, buttonStyle]}>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: colors.fabBackground }]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Mic size={24} color={colors.fabIcon} strokeWidth={2.5} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function TabLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const safeArea = useSafeAreaInsets();
  const colors = isDarkColorScheme ? ThemedColors.dark : ThemedColors.light;

  const handleFabPress = () => {
    console.log('Animated FAB pressed!');
    // Add your FAB press logic here
    // You can open a modal, navigate to a screen, etc.
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.activeText,
          tabBarInactiveTintColor: colors.inactiveText,
          tabBarStyle: {
            backgroundColor: colors.background,
            height: 70 + safeArea.bottom,
            borderTopWidth: 1,
            borderTopColor: NAV_THEME.light.border,
            elevation: 0,
            paddingBottom: 0,
          },
          tabBarLabelStyle: {
            fontFamily: 'Montserrat_500Medium',
            fontSize: 10,
            marginTop: 4,
          },
          tabBarButton(props) {
            return (
              <TouchableOpacity
                {...props}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: safeArea.bottom,
                }}
              >
                {props.children}
              </TouchableOpacity>
            );
          },
        }}>

        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, color, size }) => {
              const icon = <Home strokeWidth={1.7} size={size} color={color} />;
              return (
                <View style={styles.iconContainer}>
                  <View style={focused ? [styles.activeBackground, { backgroundColor: colors.pill }] : null} />
                  {icon}
                </View>
              );
            },
          }}
        />

        <Tabs.Screen
          name="investments"
          options={{
            title: 'Portfolio',
            tabBarIcon: ({ focused, color, size }) => {
              const icon = <LineChart strokeWidth={1.7} size={size} color={color} />;
              return (
                <View style={styles.iconContainer}>
                  <View style={focused ? [styles.activeBackground, { backgroundColor: colors.pill }] : null} />
                  {icon}
                </View>
              );
            },
          }}
        />

        {/* Empty screen for the FAB position */}
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: ({ focused, color, size }) => (
              <View style={styles.fabPlaceholder}>
                {/* This creates space for the FAB */}
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
            },
          }}
        />

        <Tabs.Screen
          name="expenses"
          options={{
            title: 'Expenses',
            tabBarIcon: ({ focused, color, size }) => {
              const icon = <Banknote strokeWidth={1.7} size={size} color={color} />;
              return (
                <View style={styles.iconContainer}>
                  <View style={focused ? [styles.activeBackground, { backgroundColor: colors.pill }] : null} />
                  {icon}
                </View>
              );
            },
          }}
        />

        <Tabs.Screen
          name="bills"
          options={{
            title: 'Bills',
            tabBarIcon: ({ focused, color, size }) => {
              const icon = <ReceiptText strokeWidth={1.7} size={size} color={color} />;
              return (
                <View style={styles.iconContainer}>
                  <View style={focused ? [styles.activeBackground, { backgroundColor: colors.pill }] : null} />
                  {icon}
                </View>
              );
            },
          }}
        />

        <Tabs.Screen
          name="notification"
          options={{
            title: 'Notification',
            tabBarIcon: ({ color, size }) => (
              <Bell strokeWidth={1.7} size={size} color={color} />
            ),
            href: null,
          }}
        />
      </Tabs>

      {/* Animated Aura FAB */}
      <View style={[styles.fabContainer, { bottom: 70 + safeArea.bottom }]}>
        <AnimatedAuraButton onPress={handleFabPress} colors={colors} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBackground: {
    position: 'absolute',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 18,
    opacity: 0.3,
  },
  inactiveIconContainer: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 2,
  },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  auraContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    borderRadius: 30,
  },
  outerAura: {
    width: 70,
    height: 70,
    opacity: 0.3,
  },
  innerAura: {
    width: 60,
    height: 60,
    opacity: 0.2,
  },
  fab: {
    zIndex: 10,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabPlaceholder: {
    width: 56,
    height: 56,
  },
});
