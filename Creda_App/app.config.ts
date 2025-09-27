import { ConfigContext, ExpoConfig } from "expo/config";
import 'dotenv/config'; // Make sure this is at the very top
const IS_DEV = process.env.APP_ENV === "development";
const IS_PREVIEW = process.env.APP_ENV === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.enigma.finvoice.dev";
  }

  if (IS_PREVIEW) {
    return "com.enigma.finvoice.preview";
  }

  return "com.enigma.finvoice";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Fin Voice (Dev)";
  }

  if (IS_PREVIEW) {
    return "Fin Voice";
  }

  return "Memora";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "finvoice",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/adaptive-icon.png",
  scheme: "vinvoice",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon-dark.png",
    resizeMode: "contain",
    backgroundColor: "#F5F5FF",
  },
  assetBundlePatterns: ["**/*", "drizzle/**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F5F5FF",
    },
    package: getUniqueIdentifier(),
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-background-task",
    "expo-notifications",
    "expo-font",
    "expo-secure-store",
    [
      "react-native-edge-to-edge",
      {
        "android": {
          "parentTheme": "Default",
          "enforceNavigationBarContrast": false
        }
      }
    ],
    [
      "expo-sqlite",
      {
        enableFTS: true,
        useSQLCipher: true,
        android: {
          enableFTS: false,
          useSQLCipher: false,
        },
        ios: {
          customBuildFlags: [
            "-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1",
          ],
        },
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to let you add them in ideas.",
      },
    ],

    [
      "expo-splash-screen",
      {
        backgroundColor: "#F5F5FF",
        image: "./assets/splash-icon-dark.png",
        dark: {
          image: "./assets/splash-icon-light.png",
          backgroundColor: "#0F0F1A",
        },
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    APP_ENV: process.env.APP_ENV,
    API_URL: process.env.API_URL,
  },
  owner: "sharian",
  runtimeVersion: {
    policy: "appVersion",
  },
});
