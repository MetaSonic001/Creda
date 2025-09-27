import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "~/components/ui/input";
import { H1, H2, Large, Lead, P } from "~/components/ui/typography";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";
import useAuthStore from "~/store/authStore";
import { Text } from "~/components/ui/text";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react-native";
import { Label } from "~/components/ui/label";
import { useSQLiteContext } from "expo-sqlite";
import { Toast } from "toastify-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SignUpPage() {
  const expoDb = useSQLiteContext();
  const { isDarkColorScheme } = useColorScheme();
  const { isLoading, signUp } = useAuthStore();
  const theme = NAV_THEME[isDarkColorScheme ? "dark" : "light"];
  const styles = createStyles(theme);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

  const validatePassword = (password: string) => {
    return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSignUp = async () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: "",
    };

    // Validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }


    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(error => error !== "");

    if (!hasErrors) {
      try {
        const result = await signUp(
          expoDb,
          formData.firstName.trim() + " " + formData.lastName.trim(),
          formData.email.toLowerCase().trim(),
          formData.password,
        );
        if (!result) {
          throw new Error("Sign Up failed, please try again.");
        }

        router.replace("/");
      } catch (error) {
        Toast.error("Sign Up Failed. Please try again.");
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
            <H2 className="mb-2">Create Account</H2>
            <Text className="text-center mb-6 text-muted-foreground">
              Join us today! Please enter your details
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.nameRow}>
            <View style={styles.nameInput}>
              <Label className="mb-2 ">First Name</Label>
              <Input
                placeholder="First name"
                className="bg-input"
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                autoCapitalize="words"
                autoComplete="given-name"
                style={[styles.input, errors.firstName && styles.inputError]}
              />
              {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
            </View>

            <View style={styles.nameInput}>
              <Label className="mb-2">Last Name</Label>
              <Input

                className="bg-input"
                placeholder="Last name"
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                autoCapitalize="words"
                autoComplete="family-name"
                style={[styles.input, errors.lastName && styles.inputError]}
              />
              {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Label className="mb-2">Email</Label>
            <Input

              className="bg-input"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={[styles.input, errors.email && styles.inputError]}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Label className="mb-2">Password</Label>
            <View style={styles.passwordContainer}>
              <Input

                className="bg-input"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                style={[styles.passwordInput, errors.password && styles.inputError]}
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

          <View style={styles.inputContainer}>
            <Label className="mb-2">Confirm Password</Label>
            <View style={styles.passwordContainer}>
              <Input

                className="bg-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={theme.text} />
                ) : (
                  <Eye size={20} color={theme.text} />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          {/* <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <View style={[styles.checkboxBox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Check size={16} color="white" />}
              </View>
            </TouchableOpacity>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {" "}and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
          {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}*/}

          <Button
            size="lg"
            style={styles.signUpButton}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text
              style={{ fontFamily: "Montserrat_600SemiBold" }}
              className="text-primary-foreground font-semibold"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </Button>

          <View style={styles.signInPrompt}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.signInLink}>Sign In</Text>
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
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 20,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: Math.min(screenWidth * 0.3, 120),
    height: Math.min(screenWidth * 0.3, 120),
  },
  titleSection: {
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  nameInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderColor: theme.border,
    color: theme.text,
    fontFamily: "Montserrat_400Regular",
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
    borderColor: theme.border,
    color: theme.text,
    fontFamily: "Montserrat_400Regular",
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: '27%',

  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingRight: 8,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Montserrat_400Regular",
  },
  termsLink: {
    color: theme.primary,
    fontWeight: '500',
    fontFamily: "Montserrat_500Medium",
  },
  signUpButton:
  {
    marginTop: 32,
    shadowColor: theme.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  signInPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: theme.text,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
  },
  signInLink: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: "Montserrat_500Medium",
  },
});
