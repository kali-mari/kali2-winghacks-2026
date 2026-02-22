import { GoogleGenerativeAI } from "@google/generative-ai";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Message = {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: number;
};

const HEALTH_SYSTEM_PROMPT = `You are a compassionate and knowledgeable health information assistant specializing in reproductive health, menstrual cycle wellness, and overall health for people with ovaries and uteruses. 

You provide:
- Evidence-based information about menstrual cycles, period symptoms, and reproductive health
- Supportive guidance on managing period pain, PMS, hormonal changes, and emotional wellness
- General health information related to periodcare, cycle tracking, and preventive wellness
- Inclusive language that respects all gender identities

IMPORTANT SAFETY GUIDELINES:
- Always recommend consulting a healthcare provider for serious symptoms or medical concerns
- Provide health information only, not medical diagnoses or prescriptions
- Be empathetic and non-judgmental about all health topics
- If asked about severe symptoms (heavy bleeding, severe pain, signs of infection), strongly recommend seeking immediate medical care
- Acknowledge the limits of your knowledge and when professional medical advice is needed

Be friendly, supportive, and use conversational language.`;

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm here to help answer questions about menstrual health, cycle wellness, and reproductive health. Feel free to ask me anything! 💬",
      sender: "assistant",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    const sendWithRetry = async (retries = 3, delayMs = 1000) => {
      try {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key not configured. Check your .env file.");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const chat = model.startChat({
          systemInstruction: {
            role: "user",
            parts: [{ text: HEALTH_SYSTEM_PROMPT }],
          },
          history: messages
            .filter((m) => m.sender !== "assistant" || m.id !== "1")
            .map((m) => ({
              role: m.sender === "user" ? "user" : "model",
              parts: [{ text: m.text }],
            })),
        });

        const result = await chat.sendMessage(inputText);
        const responseText = result.response.text();

        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), text: responseText, sender: "assistant", timestamp: Date.now() },
        ]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("429") || errorMessage.includes("quota")) {
          if (retries > 0) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                text: `⏳ API quota exceeded. Retrying in ${Math.ceil(delayMs / 1000)}s... (${retries} attempts left)`,
                sender: "assistant",
                timestamp: Date.now(),
              },
            ]);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return sendWithRetry(retries - 1, delayMs * 2);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                text: "Sorry! The free tier API quota is exhausted. Please try again in a few hours.",
                sender: "assistant",
                timestamp: Date.now(),
              },
            ]);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), text: `Error: ${errorMessage}`, sender: "assistant", timestamp: Date.now() },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    sendWithRetry();
  };

  return (
    <View style={styles.container}>
      {/* Header row: back button + title side by side */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>HEALTH CHAT</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === "user" ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, styles.assistantMessage]}>
            <ActivityIndicator color="#2a3a5a" size="small" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your cycle..."
          placeholderTextColor="#6a7a9a"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          editable={!loading}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (loading || !inputText.trim()) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={loading || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 16,
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
    fontSize: 14,
    color: "#2a3a5a",
    flexShrink: 1,
  },
  messagesContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 8,
    gap: 10,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: "#2a3a5a",
    maxWidth: "85%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#ffb3e6",
    borderRightWidth: 5,
    borderBottomWidth: 5,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffba",
    borderRightWidth: 5,
    borderBottomWidth: 5,
  },
  messageText: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 7,
    color: "#2a3a5a",
    lineHeight: 14,
  },
  inputContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#2a3a5a",
    borderRightWidth: 5,
    borderBottomWidth: 5,
    fontFamily: "PressStart2P_400Regular",
    fontSize: 7,
    color: "#2a3a5a",
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: "#ffffba",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: "#2a3a5a",
    borderRightWidth: 5,
    borderBottomWidth: 5,
    justifyContent: "center",
  },
  sendButtonText: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 8,
    color: "#2a3a5a",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
