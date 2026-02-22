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
      // Convert entries to format expected by gemini service
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
    const daysDiff = Math.ceil(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysDiff;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>CYCLE PREDICTION</Text>

      {loading || predictionLoading ? (
        <ActivityIndicator
          color="#c9184a"
          style={{ marginTop: 40 }}
          size="large"
        />
      ) : entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Not enough data yet</Text>
          <Text style={styles.emptySubtext}>
            Track your flow for at least one cycle to enable predictions
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Prediction Card */}
          {prediction && (
            <View style={styles.predictionCard}>
              <Text style={styles.cardTitle}>Next Period Estimate</Text>

              <View style={styles.predictionDetail}>
                <Text style={styles.detailLabel}>Estimated Start Date</Text>
                <Text style={styles.dateValue}>
                  {prediction.nextPeriodDate}
                </Text>
              </View>

              <View style={styles.predictionDetail}>
                <Text style={styles.detailLabel}>Days Until Period</Text>
                <Text style={styles.daysValue}>
                  {getDaysUntil(prediction.nextPeriodDate)}
                </Text>
              </View>

              <View style={styles.predictionDetail}>
                <Text style={styles.detailLabel}>Cycle Length</Text>
                <Text style={styles.detailValue}>
                  {prediction.cycleLength} days
                </Text>
              </View>

              <View style={styles.predictionDetail}>
                <Text style={styles.detailLabel}>Confidence</Text>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      { width: `${prediction.confidence * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.detailValue}>
                  {Math.round(prediction.confidence * 100)}%
                </Text>
              </View>

              {prediction.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesTitle}>Analysis</Text>
                  <Text style={styles.notesText}>{prediction.notes}</Text>
                </View>
              )}
            </View>
          )}

          {/* Health Insights Card */}
          {insights && (
            <View style={styles.insightsCard}>
              <Text style={styles.cardTitle}>Wellness Insights</Text>
              <Text style={styles.insightsText}>{insights}</Text>
            </View>
          )}

          {/* Refresh Button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadPredictions}
            disabled={predictionLoading}
          >
            <Text style={styles.refreshButtonText}>
              {predictionLoading ? "Updating..." : "Update Prediction"}
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
    backgroundColor: "#fafafa",
    paddingTop: 50,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: "#c9184a",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 16,
    marginVertical: 12,
    color: "#333",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  predictionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#c9184a",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#c9184a",
    marginBottom: 16,
  },
  predictionDetail: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 20,
    color: "#c9184a",
    fontWeight: "700",
  },
  daysValue: {
    fontSize: 28,
    color: "#c9184a",
    fontWeight: "700",
  },
  confidenceBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#c9184a",
    borderRadius: 3,
  },
  notesSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fff5f7",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ffb3c6",
  },
  notesTitle: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  insightsCard: {
    backgroundColor: "#f0f8f0",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  insightsText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  refreshButton: {
    backgroundColor: "#c9184a",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
