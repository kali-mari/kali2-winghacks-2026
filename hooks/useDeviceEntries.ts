import { off, onValue, ref } from 'firebase/database'
import { useEffect, useState } from 'react'
import { rtdb } from '../firebase/config'

export type Entry = {
  id: string
  flow: string
  mood: string
  pain: string
  sleep: string
  timestamp: string
}

export const useDeviceEntries = (limit = 30) => {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const deviceRef = ref(rtdb, '/')
    onValue(deviceRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const parsed: Entry[] = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          flow: val.flow ?? 'not_recorded',
          mood: val.mood ?? 'not_recorded',
          pain: val.pain ?? 'not_recorded',
          sleep: val.sleep ?? 'not_recorded',
          timestamp: val.timestamp ?? '',
        }))
        // Sort by timestamp descending, take last `limit`
        parsed.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1))
        setEntries(parsed.slice(0, limit))
      }
      setLoading(false)
    })
    return () => off(deviceRef)
  }, [limit])

  return { entries, loading }
}