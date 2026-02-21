import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Kali^2</Text>
      <Text style={styles.subtitleText}>Winghacks 2026</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e6f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 24,
    color: '#5a4a6a',
    marginBottom: 12,
  },
  subtitleText: {
    fontFamily: 'Silkscreen_400Regular',
    fontSize: 14,
    color: '#9a8aaa',
    letterSpacing: 2,
  },
})