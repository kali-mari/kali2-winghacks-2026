import { signInAnonymously } from 'firebase/auth'; // ← correct import
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './config'

// Call this when app loads — creates a silent account tied to the device
export const initUser = async () => {
  const { user } = await signInAnonymously(auth)
  return user.uid
}

// Get user profile
export const getUser = async (userId: string) => {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// Create or update user profile
export const saveUser = async (userId: string, name: string) => {
  const ref = doc(db, 'users', userId)
  await setDoc(ref, {
    name,
    avgCycleLength: 28,
  }, { merge: true })
}

// Add a new entry
export const addEntry = async (userId: string, entry: {
  flow: number,
  mood: number,
  cramps: number,
  sleep: number,
}) => {
  const ref = collection(db, 'users', userId, 'entries')
  await addDoc(ref, {
    ...entry,
    date: new Date(),
  })
}