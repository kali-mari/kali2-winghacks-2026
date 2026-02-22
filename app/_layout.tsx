import { PressStart2P_400Regular, useFonts } from '@expo-google-fonts/press-start-2p'
import { Silkscreen_400Regular } from '@expo-google-fonts/silkscreen'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { initUser, listenToDevice, saveDeviceEntry } from '../firebase/db'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    Silkscreen_400Regular,
    DotGothic16: require('../assets/fonts/DotGothic16-Regular.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    const init = async () => {
      const uid = await initUser()
      const cleanup = listenToDevice(async (data) => {
        await saveDeviceEntry(uid, data)
      })
      return cleanup
    }
    init()
  }, [])

  if (!fontsLoaded) return null

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}