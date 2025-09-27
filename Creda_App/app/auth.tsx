import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { H2, H3, P } from "~/components/ui/typography";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";
import { Text } from "~/components/ui/text";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- Onboarding Data ---
const onboardingSlides = [
  {
    key: '1',
    title: 'demo',
    description: 'demo.',
    //getImage: (isDark: boolean) => isDark ? require('../assets/onboarding/slide1-dark.png') : require('../assets/onboarding/slide1-light.png'),
  },
 
];


export default function AuthLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const theme = NAV_THEME[isDarkColorScheme ? "dark" : "light"];
  const styles = createStyles(theme, isDarkColorScheme);

  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
        if (hasOnboarded === null) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Failed to fetch onboarding status", error);
        // Default to showing onboarding if there's an error
        setShowOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    //checkOnboardingStatus();
  }, []);

  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animate text when the active slide changes
    textFadeAnim.setValue(0);
    textSlideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(textSlideAnim, {
        toValue: 0,
        speed: 10,
        bounciness: 5,
        useNativeDriver: true,
      })
    ]).start();
  }, [activeIndex]);


  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (slideIndex !== activeIndex) {
      setActiveIndex(slideIndex);
    }
  };

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error("Failed to save onboarding status", error);
    }
  };

  const handleNext = () => {
    if (activeIndex < onboardingSlides.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * screenWidth, animated: true });
    } else {
      handleFinishOnboarding();
    }
  };

  const getImageSource = () => {
    if (isDarkColorScheme) {
      return require('../assets/splash-icon-light.png');
    }
    return require('../assets/splash-icon-dark.png');
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // --- Render Onboarding Flow ---
  if (showOnboarding) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.onboardingContainer}>
          {/* Skip Button stays at the top */}
          <View style={styles.skipButtonContainer}>
            <TouchableOpacity onPress={handleFinishOnboarding}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Swipable Screenshot Area */}
          <View style={styles.sliderContainer}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {onboardingSlides.map((slide) => (
                <View key={slide.key} style={styles.slide}>
                  {/* Phone Mockup */}
                  <View style={styles.deviceFrame}>
                    <View style={styles.deviceSpeaker} />
                    <Image
                      source={require('../assets/onboarding/screen.png')}
                      style={styles.deviceScreen}
                      contentFit="cover" // Use 'cover' for screenshots
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Footer with Animated Text and Controls */}
          <View style={styles.footer}>
            <Animated.View
              style={[
                styles.onboardingTextContainer,
                {
                  opacity: textFadeAnim,
                  transform: [{ translateY: textSlideAnim }],
                },
              ]}
            >
              <H2 className="text-center mb-2">
                {onboardingSlides[activeIndex].title}
              </H2>
              <P className="text-center text-muted-foreground leading-relaxed">
                {onboardingSlides[activeIndex].description}
              </P>
            </Animated.View>

            <View style={styles.paginationContainer}>
              {onboardingSlides.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, activeIndex === index ? styles.activeDot : {}]}
                />
              ))}
            </View>

            <Button size="lg" onPress={handleNext} style={styles.primaryButton}>
              <Text style={{ fontFamily: "Montserrat_600SemiBold", color: theme.background }}>
                {activeIndex === onboardingSlides.length - 1 ? "Get Started" : "Next"}
              </Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- Render Original Auth Screen ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={getImageSource()}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <View style={styles.titleSection}>
          <H2 className="mb-3">Welcome Back</H2>
          <Text className="text-center mb-4 text-muted-foreground">
            Sign in to continue to your account
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <Button
            size={"lg"}
            className="mb-4"
            style={styles.primaryButton}
            onPress={() => router.replace("/signup")}
          >
            <Text style={{ fontFamily: "Montserrat_600SemiBold" }} className="text-primary-foreground font-semibold">
              Create Account
            </Text>
          </Button>
          <Button
            size={"lg"}
            variant="outline"
            onPress={() => router.replace("/login")}
            style={styles.secondaryButton}
          >
            <Text style={{ fontFamily: "Montserrat_600SemiBold" }} className="font-semibold">
              Sign In
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---
const createStyles = (theme: typeof NAV_THEME.light, isDarkColorScheme: boolean) => StyleSheet.create({
  // Common Styles
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  primaryButton: {
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // --- Onboarding Specific Styles ---
  onboardingContainer: {
    flex: 1,
    paddingTop: 60, // Space for status bar and skip button
  },
  skipButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 24,
    zIndex: 10,
  },
  skipButtonText: {
    color: theme.text,
    opacity: 0.6,
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
  },
  sliderContainer: {
    flex: 3, // Takes up the majority of the screen
    justifyContent: 'center',
  },
  slide: {
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 20,
  },

  // --- Device Mockup Styles ---
  deviceFrame: {
    width: screenWidth * 0.75, // Adjust size as needed
    height: (screenWidth * 0.75) * 2.1, // Aspect ratio of a modern phone
    backgroundColor: theme.border,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: theme.border,
    alignItems: 'center',
    paddingTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  deviceSpeaker: {
    width: 60,
    height: 6,
    backgroundColor: theme.background,
    borderRadius: 3,
    marginBottom: 10,
  },
  deviceScreen: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.background, // Fallback color
    borderRadius: 32,
  },

  footer: {
    flex: 2, // Takes up the lower part of the screen
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-around', // Distributes space nicely
  },
  onboardingTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 16, // Prevents text from touching edges
    minHeight: 120, // Prevents layout shifts
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border,
    marginHorizontal: 5,
    transition: 'all 0.3s ease', // For smooth transition (web)
  },
  activeDot: {
    backgroundColor: theme.primary,
    width: 24, // Wider "pill" shape for active dot
  },

  // --- Original Auth Screen Styles (keep as they were) ---
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logoContainer: {},
  logo: {
    width: Math.min(screenWidth * 0.6, 240),
    height: Math.min(screenWidth * 0.6, 240),
  },
  titleSection: {
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  buttonContainer: {
    gap: 12,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: 'transparent',
  },
});
