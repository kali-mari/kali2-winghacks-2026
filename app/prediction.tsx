import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CyclePrediction,
  EntryData,
  getHealthInsights,
  predictNextCycle,
} from "../firebase/gemini";
import { useDeviceEntries } from "../hooks/useDeviceEntries";

export default function PredictionScreen() {
  const { entries, loading } = useDeviceEntries(90);
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  useEffect(() => {
    if (!loading && entries.length > 0) {
      loadPredictions();
    }
  }, [loading, entries]);

  const loadPredictions = async () => {
    setPredictionLoading(true);
    try {
      const formattedEntries: EntryData[] = entries.map((e) => ({
        flow: e.flow as any,
        date: e.timestamp || new Date().toISOString().split("T")[0],
        mood: e.mood,
        pain: e.pain,
        sleep: e.sleep,
      }));

      const [pred, insght] = await Promise.all([
        predictNextCycle(formattedEntries),
        getHealthInsights(formattedEntries),
      ]);

      setPrediction(pred);
      setInsights(insght);
    } catch (error) {
      console.error("Error loading predictions:", error);
    } finally {
      setPredictionLoading(false);
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <View style={styles.container}>
      {/* Header row: back button + title side by side */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>PREDICT</Text>
      </View>

      {loading || predictionLoading ? (
        <ActivityIndicator color="#c9184a" style={{ marginTop: 40 }} size="large" />
      ) : entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>NOT ENOUGH DATA</Text>
          <Text style={styles.emptySubtext}>
            Track your flow for at least one cycle to enable predictions
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={{ width: "100%" }}
        >
          {prediction && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>NEXT PERIOD</Text>

              <View style={styles.row}>
                <Text style={styles.label}>START DATE</Text>
                <Text style={styles.bigValue}>{prediction.nextPeriodDate}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>DAYS AWAY</Text>
                <Text style={styles.bigValue}>{getDaysUntil(prediction.nextPeriodDate)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>CYCLE LENGTH</Text>
                <Text style={styles.value}>{prediction.cycleLength} days</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>CONFIDENCE</Text>
                <Text style={styles.value}>{Math.round(prediction.confidence * 100)}%</Text>
              </View>

              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${prediction.confidence * 100}%` as any }]} />
              </View>

              {prediction.notes && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.label}>ANALYSIS</Text>
                  <Text style={styles.notes}>{prediction.notes}</Text>
                </>
              )}
            </View>
          )}

          {insights && (
            <View style={[styles.card, { backgroundColor: "#caffbf" }]}>
              <Text style={styles.cardTitle}>WELLNESS INSIGHTS</Text>
              <Text style={styles.notes}>{insights}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.refreshButton, predictionLoading && { opacity: 0.5 }]}
            onPress={loadPredictions}
            disabled={predictionLoading}
          >
            <Text style={styles.refreshText}>
              {predictionLoading ? "UPDATING..." : "UPDATE"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#bae1ff",
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    borderWidth: 3,
    borderColor: "#2a3a5a",
    borderRightWidth: 5,
    borderBottomWidth: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffba",
  },
  backText: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 8,
    color: "#2a3a5a",
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 20,
    color: "#2a3a5a",
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 16,
    alignItems: "center",
    width: "100%",
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyText: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 14,
    color: "#2a3a5a",
    textAlign: "center",
  },
  emptySubtext: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 7,
    color: "#6a7a9a",
    textAlign: "center",
    lineHeight: 14,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffba",
    borderWidth: 3,
    borderColor: "#2a3a5a",
    borderRightWidth: 5,
    borderBottomWidth: 5,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 14,
    color: "#2a3a5a",
    marginBottom: 4,
  },
  row: {
    gap: 6,
  },
  label: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 7,
    color: "#6a7a9a",
  },
  bigValue: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 18,
    color: "#c9184a",
  },
  value: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 12,
    color: "#2a3a5a",
  },
  divider: {
    height: 2,
    backgroundColor: "#2a3a5a",
    opacity: 0.15,
  },
  barTrack: {
    height: 12,
    backgroundColor: "#d0d0d0",
    borderWidth: 2,
    borderColor: "#2a3a5a",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#c9184a",
  },
  notes: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 7,
    color: "#2a3a5a",
    lineHeight: 14,
  },
  refreshButton: {
    backgroundColor: "#ffb3c6",
    borderWidth: 3,
    borderColor: "#2a3a5a",
    borderRightWidth: 5,
    borderBottomWidth: 5,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
  },
  refreshText: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 12,
    color: "#2a3a5a",
  },
});
