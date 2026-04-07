import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { darkTheme, lightTheme } from '../src/constants/theme';
import { useAppStore } from '../src/store/useAppStore';
import { useNetworkMonitor } from "../src/hooks/useNetworkMonitor";
import { NetworkBanner } from "../src/components/NetworkBanner";
import { setupNotifications } from "../src/services/notificationService";
import {
  registerBackgroundTask,
  unregisterBackgroundTask,
} from "../src/services/backgroundTask";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { settings, loadData } = useAppStore();
  const [ready, setReady] = useState(false);
  const networkState = useNetworkMonitor();

  const resolvedTheme =
    settings.theme === "system" ? colorScheme : settings.theme;
  const theme = resolvedTheme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    const init = async () => {
      console.log("[NetProbe] Initializing app...");
      await loadData();

      // Setup notifications
      if (settings.notificationsEnabled) {
        await setupNotifications();
      }

      // Setup background fetch
      if (settings.backgroundCheckEnabled) {
        await registerBackgroundTask();
      } else {
        await unregisterBackgroundTask();
      }

      console.log("[NetProbe] Data loaded, app ready");
      setReady(true);
      await SplashScreen.hideAsync();
    };
    init();
  }, [
    loadData,
    settings.notificationsEnabled,
    settings.backgroundCheckEnabled,
  ]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
        <NetworkBanner networkState={networkState} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "NetProbe",
              headerLargeTitle: true,
            }}
          />
          <Stack.Screen
            name="resource/[id]"
            options={{
              title: "Resource Details",
            }}
          />
          <Stack.Screen
            name="add-resource"
            options={{
              title: "Add Resource",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "Settings",
            }}
          />
          <Stack.Screen
            name="catalog"
            options={{
              title: "Resource Catalog",
            }}
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
