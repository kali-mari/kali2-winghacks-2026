import { signInAnonymously } from 'firebase/auth'
import { off, onValue, ref } from 'firebase/database'
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, rtdb } from './config'

/* INIT USER (ANON) */
export const initUser = async () => {
  const { user } = await signInAnonymously(auth)
  return user.uid
}

/* GET USER */
export const getUser = async (userId: string) => {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

/* SAVE USER */
export const saveUser = async (userId: string, name: string) => {
  const ref = doc(db, 'users', userId)
  await setDoc(ref, {
    name,
    avgCycleLength: 28,
  }, { merge: true })
}

/* ADD ENTRY */
export type Entry = {
  flow?: 'none' | 'light_spotting' | 'moderate' | 'heavy' | 'extra_heavy' | 'not_recorded'
  sleep?: 'no_battery' | 'still_sleepy' | 'decent' | 'feeling_good' | 'fully_powered' | 'not_recorded'
  mood?: 'super_sad' | 'extra_angry' | 'only_okay' | 'comfy_cozy' | 'super_duper' | 'not_recorded'
  pain?: 'none' | 'back_pain' | 'stomach_cramps' | 'pelvic_pain' | 'headaches' | 'not_recorded'
}

export const addEntry = async (userId: string, entry: Entry) => {
  const entriesRef = collection(db, 'users', userId, 'entries')
  await addDoc(entriesRef, {
    flow: entry.flow ?? 'not_recorded',
    sleep: entry.sleep ?? 'not_recorded',
    mood: entry.mood ?? 'not_recorded',
    pain: entry.pain ?? 'not_recorded',
    date: serverTimestamp(),
  })
}

/* GET ENTRIES */
export const getEntries = async (userId: string) => {
  const entriesRef = collection(db, 'users', userId, 'entries')
  const q = query(entriesRef, orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/* LISTEN TO ESP32 DATA FROM REALTIME DATABASE */
export type DeviceData = {
  flow: string
  mood: string
  pain: string
  sleep: string
  timestamp: string
}

export const listenToDevice = (callback: (data: DeviceData) => void) => {
  const deviceRef = ref(rtdb, '/')
  onValue(deviceRef, (snapshot) => {
    const data = snapshot.val()
    if (data) callback(data)
  })
  // return cleanup function to stop listening
  return () => off(deviceRef)
}

/* SAVE ESP32 ENTRY TO FIRESTORE */
export const saveDeviceEntry = async (userId: string, deviceData: DeviceData) => {
  const entriesRef = collection(db, 'users', userId, 'entries')
  await addDoc(entriesRef, {
    flow: deviceData.flow ?? 'not_recorded',
    sleep: deviceData.sleep ?? 'not_recorded',
    mood: deviceData.mood ?? 'not_recorded',
    pain: deviceData.pain ?? 'not_recorded',
    date: serverTimestamp(),
    source: 'device',
  })
}