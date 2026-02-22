# Gemini API Setup Guide

This app now includes AI-powered menstrual cycle prediction using Google's Gemini API.

## Setup Instructions

### Step 1: Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### Step 2: Add to Environment Variables

Create or update your `.env.local` file in the root directory:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

For Expo apps, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the client.

### Step 3: Restart the App

Stop the Expo development server and restart it:

```bash
npm start
```

## Features

### Cycle Prediction

- Analyzes your period tracking history
- Uses AI to predict the next menstrual cycle start date
- Provides confidence scores based on pattern consistency
- Shows estimated cycle length in days

### Wellness Insights

- Analyzes mood, pain, and sleep patterns
- Provides personalized wellness recommendations
- Updates as you log more data

## How It Works

- **Data Analysis**: The app collects your last 90 days of tracking data
- **Pattern Recognition**: Identifies cycle lengths and patterns
- **AI Prediction**: Sends anonymized data to Gemini for analysis
- **Privacy**: Your data is analyzed in real-time and not stored by Google

## Troubleshooting

**Predictions not showing?**

- Check that you have at least one complete cycle of data logged
- Verify your `EXPO_PUBLIC_GEMINI_API_KEY` is set correctly
- Check the console for error messages

**"Not enough data yet" message?**

- You need to log at least 30 days of flow data for predictions to work
- Continue using the app and check back after a cycle or two

**API errors?**

- Ensure your Gemini API key is valid and active
- Check that you have API quota remaining at https://aistudio.google.com/app/apikey

## Notes

- Predictions work best with 2-3 complete cycle records
- The confidence score indicates how regular your cycles are
- If your cycles are irregular, the confidence will be lower but predictions may still be useful
- Always consult a healthcare provider for medical concerns
