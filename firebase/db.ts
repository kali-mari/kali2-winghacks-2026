import { signInAnonymously } from 'firebase/auth'
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './config'

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
  flow?: 'none' | 'light_spotting' | 'moderate' | 'heavy' | 'extra_heavy' | null
  sleep?: 'no_battery' | 'still_sleepy' | 'decent' | 'feeling_good' | 'fully_powered' | null
  mood?: 'super_sad' | 'extra_angry' | 'only_okay' | 'comfy_cozy' | 'super_duper' | null
  pain?: 'none' | 'back_pain' | 'stomach_cramps' | 'pelvic_pain' | 'headaches' | null
}

export const addEntry = async (userId: string, entry: Entry) => {
  const ref = collection(db, 'users', userId, 'entries')
  await addDoc(ref, {
    flow: entry.flow ?? null,
    sleep: entry.sleep ?? null,
    mood: entry.mood ?? null,
    pain: entry.pain ?? null,
    date: serverTimestamp(),
  })
}

/* GET ENTRIES */
export const getEntries = async (userId: string) => {
  const ref = collection(db, 'users', userId, 'entries')
  const q = query(ref, orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}