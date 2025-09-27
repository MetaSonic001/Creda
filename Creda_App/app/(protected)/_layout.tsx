import { Redirect, router, Stack } from "expo-router";
import * as React from "react";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Sheet from "~/components/BottomSheetComponent";
import { ActivityIndicator } from "react-native";
import useAuthStore from "~/store/authStore";
import axios from "axios";
import PortfolioOptimizationForm from "~/components/forms/PortfolioOptimizationForm";



function AppContent() {

  const { isLoading, session } = useAuthStore();

  React.useEffect(() => {
    if (session) {
      axios.defaults.headers.common = {
        'Authorization': `Bearer ${session}`,
        'Accept': 'application/json',
      };
    }
  }, [session])

  if (!isLoading && !session) {
    return <Redirect href="/auth" />;
  }

  return (
    <BottomSheetModalProvider >
      <Stack
        initialRouteName="(drawer)"
        screenOptions={{
          headerTitleStyle: { fontFamily: "Montserrat_900Black" },
          animation: "fade_from_bottom",
          animationDuration: 300,
          headerShown: false,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="(drawer)"
          options={{
            //headerTitleAlign: "center",
            title: "Fin Voice",
          }}
        />

        <Stack.Screen
          name="voiceagent"
          options={{
            presentation: "containedTransparentModal",
            title: "voiceagent",
            headerTitleStyle: {
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 18,
            },
          }}
        />
      </Stack>
    </BottomSheetModalProvider>

  );
}

export default function ProtectedLayout() {
  return (
    <React.Suspense fallback={<ActivityIndicator size={"large"} />}>
      <AppContent />
    </React.Suspense>
  );
}
