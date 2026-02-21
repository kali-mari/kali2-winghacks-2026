import 'react-native-reanimated';

// app/_layout.tsx
import { PressStart2P_400Regular, useFonts } from '@expo-google-fonts/press-start-2p';
import { Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    Silkscreen_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}


export const unstable_settings = {
  anchor: '(tabs)',
};
