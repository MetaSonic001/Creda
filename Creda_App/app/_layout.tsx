import "../global.css";
import {
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { SystemBars } from "react-native-edge-to-edge";
import * as React from "react";
import { ActivityIndicator, AppState, Platform } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import {
  useFonts,
  Montserrat_100Thin,
  Montserrat_200ExtraLight,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from "@expo-google-fonts/montserrat";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useStore from "~/store/commonStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SQLiteProvider, openDatabaseSync, useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "drizzle/migrations";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getAllScheduledNotification,
  registerForPushNotificationsAsync,
} from "~/services/notificationService";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import useAuthStore from "~/store/authStore";
import ToastManager, { Toast } from 'toastify-react-native'
import Constants from 'expo-constants';
import * as SQLite from "expo-sqlite";
import { createStoreForUser, useUserStore } from "~/store/userStore";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { initializeDatabase } from "~/db/seed";

const API_BASE_URL = Constants.expoConfig?.extra?.API_URL;

interface Notification {
  id: string;
  title: string;
  userId: string;
  message: string;
  read: boolean;
  timestamp: string;
}

SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

const LIGHT_THEME = {
  ...DefaultTheme,
  colors: {
    ...NAV_THEME.light,
    card: "hsl(240 100.00% 98.04%)",
  },
};

const DARK_THEME = {
  ...DarkTheme,
  colors: {
    ...NAV_THEME.dark,
    card: "hsl(240 26.83% 8.04%)",
  },
};
export { ErrorBoundary } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});



function AppContent() {
  const expoDb = useSQLiteContext();
  const db = drizzle(expoDb);
  useDrizzleStudio(expoDb);
  const { success, error } = useMigrations(db, migrations);

  const { setSharedLink, openBottomSheet } = useStore();

  const hasMounted = React.useRef(false);

  let [fontsLoaded] = useFonts({
    Montserrat_100Thin,
    Montserrat_200ExtraLight,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });

  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const { isLoading, session, initializeAuth, currentUser
  } = useAuthStore();


  const theme = NAV_THEME[isDarkColorScheme ? "dark" : "light"];




  React.useEffect(() => {
    (async () => {
      await expoDb.execAsync(`PRAGMA foreign_keys = ON;`);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      await initializeAuth();
    })();
  }, []);


  React.useEffect(() => {
    (() => {
      console.log(fontsLoaded, isLoading, success, error);
      if (fontsLoaded && success && !error) {
        console.log("Fonts loaded successfully");
        SplashScreen.hide();
      }
    })();
  }, [fontsLoaded, success, error]);

  const useIsomorphicLayoutEffect =
    Platform.OS === "web" ? React.useLayoutEffect : React.useEffect;

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      document.documentElement.classList.add("bg-background");
    }

    //setAndroidNavigationBar(colorScheme);
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, [colorScheme]);

  useEffect(() => {
    let notificationListener: any;
    let responseListener: any;

    const initializeNotifications = async () => {
      try {
        console.log("notification initialized");

        notificationListener =
          Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification);
          });
        responseListener =
          Notifications.addNotificationResponseReceivedListener((response) => {
          });

      } catch (err) {
        console.error("Notification init error:", err);
      }
    };

    initializeNotifications();

    return () => {
      if (notificationListener) {
        Notifications.removeNotificationSubscription(notificationListener);
      }
      if (responseListener) {
        Notifications.removeNotificationSubscription(responseListener);
      }
    };
  }, []);


  if (!fontsLoaded || !isColorSchemeLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SystemBars style={isDarkColorScheme ? "light" : "dark"} />


        <Stack
          initialRouteName="(protected)"
          screenOptions={{
            headerTitleStyle: { fontFamily: "Montserrat_900Black" },
            animation: "slide_from_right",
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="signup"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(protected)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>

      </GestureHandlerRootView>

      <PortalHost />
      <ToastManager
        useModal={false}
        theme={isDarkColorScheme ? "dark" : "light"}
        minHeight={"auto"}
        style={{
          paddingVertical: 12,
          backgroundColor: theme.card,
          shadowColor: theme.text,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        textStyle={{ color: theme.text }}
        showProgressBar={false}
        animationStyle={"slide"}
        showCloseIcon={false}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const queryClient = new QueryClient();
  useReactQueryDevTools(queryClient);

  return (
    <React.Suspense fallback={<ActivityIndicator size={"large"} />}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider
          databaseName="finvoice.db"
          options={{ enableChangeListener: true }}
        >
          <KeyboardProvider statusBarTranslucent={true}>
            <AppContent />
          </KeyboardProvider>
        </SQLiteProvider>
      </QueryClientProvider>
    </React.Suspense>
  );
}

