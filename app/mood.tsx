import { StyleSheet, Text, View } from 'react-native'

export default function MoodScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MOOD</Text>
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
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 16,
    color: '#2a3a5a',
  },
})