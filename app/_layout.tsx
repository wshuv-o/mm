import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Slot } from "expo-router";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "@/hooks/useColorScheme";
import { API } from "@/api/api";
import { Portal } from "react-native-paper";
import { SnackBarFeedbackCtxProvider } from "@/components/shared/SnackBarFeedback";
import { IntendedPageCtxProvider } from "@/components/IntendedPageCtxProvider";
import { Platform } from "react-native";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retries failed queries once
      refetchOnWindowFocus: false, // Avoid refetching on window focus
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Combine both fonts here
  const [loaded] = useFonts({
    Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
    Roboto: require("@/assets/fonts/Roboto-Regular.ttf"),
    IcoMoon: require("@/assets/icons/icomoon.ttf"), // Load IcoMoon font here
    // Inter_400Regular,
    // Inter_500Medium,
    // Inter_600SemiBold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Portal.Host>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <SnackBarFeedbackCtxProvider
            onMount={(trigger) => {
              queryClient.setDefaultOptions({
                mutations: {
                  onError(error) {
                    trigger(error);
                  },
                },
              });
            }}
          >
            <IntendedPageCtxProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="+not-found" />
            </Stack>
            </IntendedPageCtxProvider>
          </SnackBarFeedbackCtxProvider>
        </ThemeProvider>
      </Portal.Host>
    </QueryClientProvider>
  );
}
