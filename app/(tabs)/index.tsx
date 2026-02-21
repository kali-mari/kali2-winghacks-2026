import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const app = () => {
  return (
    <View style={styles.container}> 
      <Text style={styles.text}>Kali^2</Text>
    </View>
  )
}

export default app

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  text: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
  }
})