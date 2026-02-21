import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>FlowFriend</Text>
      <Text style={styles.subtitleText}>with your cycle companion, Floppy!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bae1ff',
    alignItems: 'center',
    paddingTop: 80,
  },
  titleText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 24,
    color: '#2a3a5a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: 'Silkscreen_400Regular',
    fontSize: 14,
    color: '#6a7a9a',
    letterSpacing: 2,
    textAlign: 'center',
  },
})