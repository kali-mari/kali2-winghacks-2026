import { initializeApp } from 'firebase/app'
import { addDoc, collection, getFirestore, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "kali2-winghacks-2026-db.firebaseapp.com",
  projectId: "kali2-winghacks-2026-db",
  storageBucket: "kali2-winghacks-2026-db.firebasestorage.app",
  messagingSenderId: "887880052947",
  appId: "1:887880052947:web:3bf5c89a1cf88b687ee426"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// null entry = user didn't log that day = tamagotchi is hungry
const testEntries = [
  // logged ✓
  { daysAgo: 30, flow: 'heavy', sleep: null, mood: null, pain: null },
  { daysAgo: 29, flow: 'heavy', sleep: 'no_battery', mood: null, pain: null },
  { daysAgo: 28, flow: 'moderate', sleep: null, mood: 'super_sad', pain: 'stomach_cramps' },
  { daysAgo: 27, flow: 'moderate', sleep: 'still_sleepy', mood: null, pain: null },
  { daysAgo: 26, flow: 'light_spotting', sleep: null, mood: 'only_okay', pain: null },

  // missed ✗ (no entry at all)
  // daysAgo: 25 — skipped entirely

  // logged ✓
  { daysAgo: 24, flow: 'none', sleep: 'decent', mood: null, pain: null },
  { daysAgo: 23, flow: null, sleep: 'feeling_good', mood: 'comfy_cozy', pain: null },
  { daysAgo: 22, flow: null, sleep: null, mood: 'super_duper', pain: null },

  // missed ✗
  // daysAgo: 21 — skipped entirely
  // daysAgo: 20 — skipped entirely

  // logged ✓
  { daysAgo: 19, flow: 'none', sleep: 'fully_powered', mood: null, pain: null },
  { daysAgo: 18, flow: null, sleep: null, mood: 'super_duper', pain: 'none' },
  { daysAgo: 17, flow: null, sleep: 'feeling_good', mood: null, pain: null },
  { daysAgo: 16, flow: null, sleep: null, mood: 'comfy_cozy', pain: null },

  // missed ✗
  // daysAgo: 15 — skipped entirely

  // logged ✓
  { daysAgo: 14, flow: 'none', sleep: null, mood: null, pain: 'headaches' },
  { daysAgo: 13, flow: null, sleep: 'still_sleepy', mood: 'extra_angry', pain: null },
  { daysAgo: 12, flow: null, sleep: 'no_battery', mood: null, pain: 'back_pain' },

  // missed ✗
  // daysAgo: 11 — skipped entirely

  // logged ✓
  { daysAgo: 10, flow: 'light_spotting', sleep: null, mood: null, pain: null },
  { daysAgo: 9, flow: 'heavy', sleep: 'no_battery', mood: 'super_sad', pain: 'stomach_cramps' },
  { daysAgo: 8, flow: 'heavy', sleep: null, mood: null, pain: 'pelvic_pain' },
  { daysAgo: 7, flow: 'moderate', sleep: 'still_sleepy', mood: null, pain: null },
  { daysAgo: 6, flow: null, sleep: null, mood: 'only_okay', pain: null },

  // missed ✗
  // daysAgo: 5 — skipped entirely

  // logged ✓
  { daysAgo: 4, flow: 'none', sleep: 'decent', mood: null, pain: null },
  { daysAgo: 3, flow: null, sleep: null, mood: 'comfy_cozy', pain: null },
  { daysAgo: 2, flow: null, sleep: 'feeling_good', mood: null, pain: null },
  { daysAgo: 1, flow: null, sleep: null, mood: 'super_duper', pain: null },
]

const seedData = async () => {
  const testUserId = 'testUser123'
  const ref = collection(db, 'users', testUserId, 'entries')

  for (const entry of testEntries) {
    const date = new Date()
    date.setDate(date.getDate() - entry.daysAgo)

    await addDoc(ref, {
      flow: entry.flow,
      sleep: entry.sleep,
      mood: entry.mood,
      pain: entry.pain,
      date: Timestamp.fromDate(date),
    })

    console.log(`✓ Added entry for ${date.toDateString()}`)
  }

  console.log('Seeding complete!')
}

seedData()