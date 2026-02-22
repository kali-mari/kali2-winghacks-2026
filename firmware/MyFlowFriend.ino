#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <TFT_eSPI.h>
#include <Preferences.h>
#include "secrets.h"
#include "time.h"
#include "littleguy.h"
#include "background.h" 
#include "mood.h"
#include "pain.h"
#include "sleep.h"
#include "flow.h"

/* --- CONFIGURATION --- */
const char* ssid     = SECRET_SSID;
const char* password = SECRET_PASS;
const char* serverUrl = SECRET_URL;
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = -18000; 
const int   daylightOffset_sec = 3600;

#define FRAME_W 32         
#define FRAME_H 35         
#define SHEET_WIDTH 320   
#define SCALE_FACTOR 6   
#define MY_BG_COLOR 0xBF1F 

/* --- OBJECTS --- */
TFT_eSPI tft = TFT_eSPI();
TFT_eSprite frameBuffer = TFT_eSprite(&tft);   
TFT_eSprite bigGuyCanvas = TFT_eSprite(&tft);  
Preferences prefs;

/* --- STATE & TIMING --- */
unsigned long lastLogTime = 0; 
int animFrame = 0;
unsigned long lastAnimUpdate = 0;
bool isLocked = false;

bool showingMessage = false;
unsigned long messageStartTime = 0;
unsigned long messageDuration = 3000; 

enum PetMood { HAPPY = 0, SAD = 1, DEAD = 2 };
enum Screen { FLOW = 0, PAIN = 1, SLEEP = 2, MOOD = 3, HOME = 4 };

const char* flowMap[]  = {"none", "light_spotting", "moderate", "heavy", "extra_heavy"};
const char* sleepMap[] = {"no_battery", "still_sleepy", "decent", "feeling_good", "fully_powered"};
const char* moodMap[]  = {"super_sad", "extra_angry", "only_okay", "comfy_cozy", "super_duper"};
const char* painMap[]  = {"none", "back_pain", "stomach_cramps", "pelvic_pain", "headaches"};

const char* currentFlowStr = "not_recorded";
const char* currentSleepStr = "not_recorded";
const char* currentMoodStr = "not_recorded";
const char* currentPainStr = "not_recorded";

Screen currentScreen = HOME;
bool screenChanged = true;
uint16_t calData[5] = {354, 3485, 322, 3252, 7};

/* --- TIME UTILITIES --- */
unsigned long getNow() {
  time_t now;
  time(&now); 
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return 0; 
  return (unsigned long)now;
}

String getTimestampStr() {
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)) return "Failed to obtain time";
  char timeStringBuff[50];
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(timeStringBuff);
}

/* --- WIFI & SETUP --- */
void connectWiFi() {
  WiFi.disconnect(true); 
  delay(1000);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(1000);
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    struct tm timeinfo;
    int retry = 0;
    while(!getLocalTime(&timeinfo) && retry < 10) { 
      delay(1000); 
      retry++; 
    }
  }
}

void setup() {
  Serial.begin(115200);
  prefs.begin("pet-logic", false);
  lastLogTime = prefs.getULong("lastLogTime", 0);

  tft.init();
  tft.setRotation(1);   
  tft.setSwapBytes(true); 
  tft.setTouch(calData); 
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE);
  tft.drawCentreString("Connecting WiFi...", 240, 150, 2);

  connectWiFi();

  unsigned long now = getNow();
  if (now > 0 && lastLogTime > 0 && (now - lastLogTime < 86400)) {
    isLocked = true;
  }

  tft.fillScreen(MY_BG_COLOR);
  frameBuffer.createSprite(FRAME_W, FRAME_H);
  frameBuffer.setSwapBytes(true);
  bigGuyCanvas.createSprite(FRAME_W * SCALE_FACTOR, FRAME_H * SCALE_FACTOR);
  bigGuyCanvas.setSwapBytes(true);
}

/* --- FIREBASE --- */
void sendDataToFirebase() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure *client = new WiFiClientSecure;
    client->setInsecure();
    HTTPClient http;
    http.begin(*client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"timestamp\":\"" + getTimestampStr() + "\",";
    json += "\"flow\":\"" + String(currentFlowStr) + "\",";
    json += "\"sleep\":\"" + String(currentSleepStr) + "\",";
    json += "\"mood\":\"" + String(currentMoodStr) + "\",";
    json += "\"pain\":\"" + String(currentPainStr) + "\"}";

    http.POST(json);
    http.end();
    delete client;
  }
}

/* --- DRAWING --- */
void drawPet(PetMood mood, int frame) {
  int screenX = 240, screenY = 220; 
  int bigW = FRAME_W * SCALE_FACTOR, bigH = FRAME_H * SCALE_FACTOR;
  int eraseX = screenX - (bigW / 2), eraseY = screenY - (bigH / 2);
  
  bigGuyCanvas.fillSprite(MY_BG_COLOR); 
  int sourceX = frame * FRAME_W;
  int sourceY = (int)mood * FRAME_H;
  
  frameBuffer.fillSprite(TFT_BLACK); 
  frameBuffer.pushImage(-sourceX, -sourceY, SHEET_WIDTH, 105, spritesheet_data);
  
  for (int y = 0; y < FRAME_H; y++) {
    for (int x = 0; x < FRAME_W; x++) {
      uint16_t p = frameBuffer.readPixel(x, y);
      if (p != TFT_BLACK) bigGuyCanvas.fillRect(x * SCALE_FACTOR, y * SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR, p);
    }
  }
  bigGuyCanvas.pushSprite(eraseX, eraseY);
}

/* --- GAME LOGIC --- */
void updateGameLogic() {
  unsigned long now = getNow();
  if (millis() - lastAnimUpdate > 500) { 
    lastAnimUpdate = millis();
    animFrame = (animFrame + 1) % 10; 

    if (now > 0 && isLocked && (now - lastLogTime >= 86400)) {
        isLocked = false;
    }

    PetMood currentMood = HAPPY;
    if (now > 0 && lastLogTime > 0) {
      unsigned long timeDiff = now - lastLogTime;
      if (timeDiff > 172800) currentMood = DEAD;   
      else if (timeDiff > 86400) currentMood = SAD; 
    }
    
    drawPet(currentMood, animFrame);
  }
}

/* --- LOOP --- */
void loop() {
  updateGameLogic();
  uint16_t x = 0, y = 0;

  // CLEAR MESSAGE
  if (showingMessage && (millis() - messageStartTime >= messageDuration)) {
    showingMessage = false;
    screenChanged = true;
  }
  
  if (tft.getTouch(&x, &y)) {
    
    // SECRET RESET BUTTON
    if (currentScreen == HOME && x > 400 && y > 250 && !showingMessage) {
       lastLogTime = 0;
       isLocked = false;
       prefs.putULong("lastLogTime", 0);
       
       tft.fillScreen(TFT_WHITE);
       tft.setTextColor(TFT_BLACK);
       tft.drawCentreString("PET RESET!", 240, 150, 4);
       screenChanged = true;
       delay(2000);
    }

    if (!isLocked && !showingMessage) {
      // NAVIGATION
      if (currentScreen == HOME && y < 70) {
        if (x >= 31 && x <= 88)   { currentScreen = FLOW; screenChanged = true; } 
        else if (x >= 148 && x <= 203) { currentScreen = PAIN; screenChanged = true; } 
        else if (x >= 270 && x <= 325) { currentScreen = SLEEP; screenChanged = true; }
        else if (x >= 392 && x <= 448) { currentScreen = MOOD; screenChanged = true; }
        if (screenChanged) delay(300);
      }
      // RATING
      else if (currentScreen != HOME && y >= 35 && y < 100) {
        int rating = 0;
        if (x > 45 && x < 110) rating = 1;
        else if (x > 127 && x < 190) rating = 2;
        else if (x > 208 && x < 271) rating = 3;
        else if (x > 290 && x < 353) rating = 4;
        else if (x > 370 && x < 433) rating = 5;
        if (rating > 0) {
          if (currentScreen == FLOW) currentFlowStr = flowMap[rating-1];
          else if (currentScreen == PAIN) currentPainStr = painMap[rating-1];
          else if (currentScreen == SLEEP) currentSleepStr = sleepMap[rating-1];
          else if (currentScreen == MOOD) currentMoodStr = moodMap[rating-1];
          currentScreen = HOME; screenChanged = true; delay(300);
        }
      }
    }

    // SAVE BUTTON
    if (currentScreen == HOME && x > 10 && x < 65 && y > 253 && y < 310 && !showingMessage) {
      showingMessage = true;
      messageStartTime = millis();
      messageDuration = 3000;

      if (!isLocked) {
        sendDataToFirebase();
        lastLogTime = getNow();
        prefs.putULong("lastLogTime", lastLogTime);
        isLocked = true;
        tft.setTextColor(TFT_WHITE);
        tft.drawCentreString("Thank you for checking in!", 240, 80, 4);
      } else {
        tft.setTextColor(TFT_WHITE);
        tft.drawCentreString("See you tomorrow!", 240, 80, 4);
      }
    }
  }

  if (screenChanged) {
    screenChanged = false; 
    tft.fillScreen(MY_BG_COLOR); 
    if (currentScreen == HOME) tft.pushImage(0,0, 480, 320, background_data);
    else if (currentScreen == FLOW) tft.pushImage(0,0, 480, 320, flow_data);
    else if (currentScreen == PAIN) tft.pushImage(0,0, 480, 320, pain_data);
    else if (currentScreen == SLEEP) tft.pushImage(0,0, 480, 320, sleep_data);
    else if (currentScreen == MOOD) tft.pushImage(0,0, 480, 320, mood_data);
  }
}