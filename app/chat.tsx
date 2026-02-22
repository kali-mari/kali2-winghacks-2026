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
    // Auto-scroll to bottom when new messages arrive
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
        console.log(
          "API Key loaded:",
          apiKey ? "✓ Key exists" : "✗ No key found",
        );

        if (!apiKey) {
          throw new Error(
            "Gemini API key not configured. Check your .env file.",
          );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        const chat = model.startChat({
          systemInstruction: {
            parts: [{ text: HEALTH_SYSTEM_PROMPT }],
          },
          history: messages
            .filter((m) => m.sender !== "assistant" || m.id !== "1") // Skip initial greeting in history
            .map((m) => ({
              role: m.sender === "user" ? "user" : "model",
              parts: [{ text: m.text }],
            })),
        });

        console.log("Sending message to Gemini...");
        const result = await chat.sendMessage(inputText);
        const responseText = result.response.text();

        const assistantMessage: Message = {
          id: Date.now().toString(),
          text: responseText,
          sender: "assistant",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Chat error details:", errorMessage);

        // Check if it's a quota exceeded error
        if (errorMessage.includes("429") || errorMessage.includes("quota")) {
          if (retries > 0) {
            console.log(
              `Quota exceeded. Retrying in ${delayMs}ms... (${retries} retries left)`,
            );

            // Add a status message
            const retryMessage: Message = {
              id: Date.now().toString(),
              text: `⏳ API quota exceeded. Retrying in ${Math.ceil(delayMs / 1000)}s... (${retries} attempts left)`,
              sender: "assistant",
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, retryMessage]);

            // Wait and retry with exponential backoff
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return sendWithRetry(retries - 1, delayMs * 2);
          } else {
            const assistantMessage: Message = {
              id: Date.now().toString(),
              text: "Sorry! The free tier API quota is exhausted. Please try again in a few hours, or upgrade to a paid plan at https://ai.google.dev/pricing",
              sender: "assistant",
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }
        } else {
          const assistantMessage: Message = {
            id: Date.now().toString(),
            text: `Error: ${errorMessage}`,
            sender: "assistant",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } finally {
        setLoading(false);
      }
    };

    sendWithRetry();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>HEALTH CHAT</Text>

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
              message.sender === "user"
                ? styles.userMessage
                : styles.assistantMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.sender === "user"
                  ? styles.userMessageText
                  : styles.assistantMessageText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, styles.assistantMessage]}>
            <ActivityIndicator color="#c9184a" size="small" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about your cycle or health..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={loading || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#bae1ff",
    paddingTop: 50,
    paddingHorizontal: 0,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    color: "#2a3a5a",
    fontWeight: "700",
  },
  title: {
    fontSize: 18,
    fontFamily: "PressStart2P_400Regular",
    paddingHorizontal: 16,
    marginVertical: 12,
    color: "#2a3a5a",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  messageBubble: {
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    maxWidth: "88%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#c9184a",
    borderWidth: 2,
    borderColor: "#2a3a5a",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffba",
    borderWidth: 2,
    borderColor: "#2a3a5a",
  },
  messageText: {
    fontSize: 12,
    lineHeight: 18,
  },
  userMessageText: {
    color: "#fff",
    fontWeight: "500",
  },
  assistantMessageText: {
    color: "#2a3a5a",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 16,
    backgroundColor: "#bae1ff",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    fontSize: 12,
    color: "#333",
    borderWidth: 2,
    borderColor: "#2a3a5a",
    height: 40,
  },
  sendButton: {
    backgroundColor: "#ffb3e6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#2a3a5a",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#2a3a5a",
    fontWeight: "700",
    fontSize: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
