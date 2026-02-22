import { router } from 'expo-router'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>FlowFriend</Text>
      <Text style={styles.subtitle}>WITH YOUR CYCLE COMPANION, FLOPPY!</Text>

      <View style={styles.buttonGrid}>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ffffba' }]}
          onPress={() => router.push('/flow')}
        >
          <Image source={require('../assets/images/flow.png')} style={styles.buttonImage} />
          <Text style={styles.buttonText}>FLOW</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ffffba' }]}
          onPress={() => router.push('/cramps')}
        >
          <Image source={require('../assets/images/cramps.png')} style={styles.buttonImage} />
          <Text style={styles.buttonText}>CRAMPS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ffffba' }]}
          onPress={() => router.push('/sleep')}
        >
          <Image source={require('../assets/images/sleep.png')} style={styles.buttonImage} />
          <Text style={styles.buttonText}>SLEEP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ffffba' }]}
          onPress={() => router.push('/mood')}
        >
          <Image source={require('../assets/images/mood.png')} style={styles.buttonImage} />
          <Text style={styles.buttonText}>MOOD</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bae1ff',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 24,
    color: '#2a3a5a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Silkscreen_400Regular',
    fontSize: 13,
    color: '#6a7a9a',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  button: {
    width: 140,
    height: 140,
    borderWidth: 3,
    borderColor: '#2a3a5a',
    borderRightWidth: 5,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  buttonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    color: '#2a3a5a',
  },
})