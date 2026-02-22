import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function PainScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Pain</Text>
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
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    borderWidth: 3,
    borderColor: '#2a3a5a',
    borderRightWidth: 5,
    borderBottomWidth: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffba',
  },
  backText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#2a3a5a',
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 16,
    color: '#2a3a5a',
  },
})