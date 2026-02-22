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
export const addEntry = async (userId: string, entry: {
  flow: number,
  mood: number,
  cramps: number,
  sleep: number,
}) => {
  const ref = collection(db, 'users', userId, 'entries')
  await addDoc(ref, {
    ...entry,
    date: serverTimestamp(),
    source: 'device',
  })
}

/* GET ENTRIES */
export const getEntries = async (userId: string) => {
  const ref = collection(db, 'users', userId, 'entries')
  const q = query(ref, orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}