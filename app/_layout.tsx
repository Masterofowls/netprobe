import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { darkTheme, lightTheme } from '../src/constants/theme';
import { useAppStore } from '../src/store/useAppStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { settings, loadData } = useAppStore();
  const [ready, setReady] = useState(false);

  const resolvedTheme =
    settings.theme === 'system' ? colorScheme : settings.theme;
  const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const init = async () => {
      await loadData();
      setReady(true);
      await SplashScreen.hideAsync();
    };
    init();
  }, [loadData]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
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
              title: 'NetProbe',
              headerLargeTitle: true,
            }}
          />
          <Stack.Screen
            name="resource/[id]"
            options={{
              title: 'Resource Details',
            }}
          />
          <Stack.Screen
            name="add-resource"
            options={{
              title: 'Add Resource',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'Settings',
            }}
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
