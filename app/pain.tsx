import { router } from 'expo-router'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDeviceEntries } from '../hooks/useDeviceEntries'

const PAIN_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  none:           { label: 'None',           color: '#d4f0c0', emoji: '○' },
  back_pain:      { label: 'Back Pain',      color: '#ffd6a5', emoji: '↑' },
  stomach_cramps: { label: 'Cramps',         color: '#ffb3c6', emoji: '~' },
  pelvic_pain:    { label: 'Pelvic Pain',    color: '#ff6b9d', emoji: '◇' },
  headaches:      { label: 'Headaches',      color: '#c77dff', emoji: '!' },
  not_recorded:   { label: 'No Data',        color: '#d0d0d0', emoji: '?' },
}

export default function PainScreen() {
  const { entries, loading } = useDeviceEntries(30)

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>PAIN</Text>

      {loading ? (
        <ActivityIndicator color="#c77dff" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.legend}>
            {Object.entries(PAIN_CONFIG).map(([key, cfg]) => (
              <View key={key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
                <Text style={styles.legendText}>{cfg.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {entries.map((entry) => {
              const cfg = PAIN_CONFIG[entry.pain] ?? PAIN_CONFIG.not_recorded
              const date = entry.timestamp ? entry.timestamp.slice(5, 10) : '??'
              return (
                <View key={entry.id} style={[styles.cell, { backgroundColor: cfg.color }]}>
                  <Text style={styles.cellEmoji}>{cfg.emoji}</Text>
                  <Text style={styles.cellDate}>{date}</Text>
                </View>
              )
            })}
          </View>
        </ScrollView>
      )}
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
    fontSize: 28,
    color: '#2a3a5a',
    marginBottom: 24,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: '#2a3a5a',
  },
  legendText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#2a3a5a',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  cell: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: '#2a3a5a',
    borderRightWidth: 5,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  cellEmoji: {
    fontSize: 36,
    color: '#2a3a5a',
    textAlign: 'center',
    lineHeight: 42,
  },
  cellDate: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 5,
    color: '#2a3a5a',
    marginTop: 2,
  },
})
