import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { H1, H2, Large, Lead, P } from "~/components/ui/typography";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";
import useAuthStore from "~/store/authStore";
import { Text } from "~/components/ui/text";
import { Eye, EyeOff, ArrowLeft } from "lucide-react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Toast } from "toastify-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SignInPage() {
  const expoDb = useSQLiteContext();
  const { isDarkColorScheme } = useColorScheme();
  const { isLoading, signIn } = useAuthStore();
  const theme = NAV_THEME[isDarkColorScheme ? "dark" : "light"];
  const styles = createStyles(theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const getImageSource = () => {
    if (isDarkColorScheme) {
      return require('../assets/splash-icon-light.png');
    }
    return require('../assets/splash-icon-dark.png');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      try {
        const result = await signIn(expoDb, email, password);
        if (!result) {
          Toast.error("Sign In Failed. Please try again.");
        }


        router.replace('/');
        // Navigation will be handled by the auth store/context
      } catch (error) {
        Alert.alert("Sign In Failed", error.message || "Please check your credentials and try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={getImageSource()}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <View style={styles.titleSection}>
            <H2 className="mb-2">Sign In</H2>
            <Text className="text-center mb-6  text-muted-foreground">
              Welcome back! Please enter your details
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Label nativeID="email" className="font-semibold mb-2">
              Email
            </Label>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}

              className="bg-input"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              id="email"
              aria-labelledby="email"
              style={[styles.input, errors.email && styles.inputError, { fontFamily: "Montserrat_400Regular" }]}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Label nativeID="password" className=" font-semibold mb-2">
              Password
            </Label>
            <View style={styles.passwordContainer}>
              <Input
                placeholder="Enter your password"
                value={password}
                className="bg-input"
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                id="password"
                aria-labelledby="password"
                style={[styles.passwordInput, errors.password && styles.inputError, { fontFamily: "Montserrat_400Regular" }]}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.text} />
                ) : (
                  <Eye size={20} color={theme.text} />
                )}
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <Button
            size="lg"
            style={styles.signInButton}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text
              style={{ fontFamily: "Montserrat_600SemiBold" }}
              className="text-primary-foreground font-semibold"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </Button>

          <View style={styles.signUpPrompt}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/signup")}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof NAV_THEME.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    width: '100%',
    flexGrow: 1,
    paddingHorizontal: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: Math.min(screenWidth * 0.4, 160),
    height: Math.min(screenWidth * 0.4, 160),
  },
  titleSection: {
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
  },
  inputError: {
    borderColor: theme.notification,
  },
  errorText: {
    color: theme.notification,
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Montserrat_400Regular",
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: '27%',
  },
  signInButton: {
    shadowColor: theme.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 32,
    marginBottom: 24,
  },
  signUpPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: theme.text,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
  },
  signUpLink: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: "Montserrat_500Medium",
  },
});
