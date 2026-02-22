import { GoogleGenerativeAI } from "@google/generative-ai";

export type CyclePrediction = {
  nextPeriodDate: string;
  cycleLength: number;
  confidence: number;
  notes: string;
};

export type EntryData = {
  flow?:
    | "none"
    | "light_spotting"
    | "moderate"
    | "heavy"
    | "extra_heavy"
    | "not_recorded";
  date: string;
  mood?: string;
  pain?: string;
  sleep?: string;
};

/**
 * Predicts the next menstrual cycle based on historical data
 */
export const predictNextCycle = async (
  entries: EntryData[],
): Promise<CyclePrediction | null> => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key not configured");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Prepare the data summary
    const recentEntries = entries.slice(0, 90); // Last 3 months
    const flowEntries = recentEntries
      .filter((e) => e.flow && e.flow !== "none" && e.flow !== "not_recorded")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate cycle patterns
    const cycleLengths: number[] = [];
    for (let i = 1; i < flowEntries.length; i++) {
      const daysBetween = Math.floor(
        (new Date(flowEntries[i - 1].date).getTime() -
          new Date(flowEntries[i].date).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysBetween > 0 && daysBetween < 60) {
        cycleLengths.push(daysBetween);
      }
    }

    const avgCycleLength =
      cycleLengths.length > 0
        ? Math.round(
            cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length,
          )
        : 28;

    // Prepare data for Gemini
    const dataForAnalysis = {
      recentFlowData: flowEntries
        .slice(0, 6)
        .map((e) => ({ date: e.date, flow: e.flow })),
      cycleLengths,
      averageCycleLength: avgCycleLength,
      totalDataPoints: recentEntries.length,
    };

    const prompt = `You are a menstrual health assistant. Based on the following cycle tracking data, predict the next menstrual period start date and provide a confidence score.

Data Analysis:
- Recent flow data (last 6 periods): ${JSON.stringify(dataForAnalysis.recentFlowData)}
- Calculated cycle lengths (in days): ${JSON.stringify(dataForAnalysis.cycleLengths)}
- Average cycle length: ${dataForAnalysis.averageCycleLength} days
- Total data points analyzed: ${dataForAnalysis.totalDataPoints}

Today's date: ${new Date().toISOString().split("T")[0]}

Please respond in valid JSON format with EXACTLY this structure (no markdown, no code blocks):
{
  "nextPeriodDate": "YYYY-MM-DD",
  "cycleLength": 28,
  "confidence": 0.85,
  "notes": "Brief explanation of the prediction"
}

Only return the JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse the response - handle potential markdown code blocks
    let cleanJson = responseText;
    if (cleanJson.includes("```json")) {
      cleanJson = cleanJson.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanJson.includes("```")) {
      cleanJson = cleanJson.replace(/```\n?/g, "");
    }
    cleanJson = cleanJson.trim();

    const prediction = JSON.parse(cleanJson) as CyclePrediction;
    return prediction;
  } catch (error) {
    console.error("Error predicting cycle:", error);
    return null;
  }
};

/**
 * Gets health insights based on symptom patterns
 */
export const getHealthInsights = async (
  entries: EntryData[],
): Promise<string | null> => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key not configured");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const recentEntries = entries.slice(0, 30); // Last month

    // Analyze mood, pain, and sleep patterns
    const moodCounts = {} as Record<string, number>;
    const painCounts = {} as Record<string, number>;
    const sleepCounts = {} as Record<string, number>;

    recentEntries.forEach((e) => {
      if (e.mood && e.mood !== "not_recorded") {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      }
      if (e.pain && e.pain !== "not_recorded") {
        painCounts[e.pain] = (painCounts[e.pain] || 0) + 1;
      }
      if (e.sleep && e.sleep !== "not_recorded") {
        sleepCounts[e.sleep] = (sleepCounts[e.sleep] || 0) + 1;
      }
    });

    const prompt = `As a menstrual health assistant, provide brief wellness insights based on this tracking data from the past month:

Mood patterns: ${JSON.stringify(moodCounts)}
Pain patterns: ${JSON.stringify(painCounts)}
Sleep patterns: ${JSON.stringify(sleepCounts)}

Provide 2-3 actionable insights in a friendly, supportive tone. Keep it under 100 words.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error getting health insights:", error);
    return null;
  }
};
