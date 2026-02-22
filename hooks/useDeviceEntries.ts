import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";

export type Entry = {
  id: string;
  flow: string;
  mood: string;
  pain: string;
  sleep: string;
  timestamp: string;
};

export const useDeviceEntries = (limit = 30) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user?.uid) {
        const entriesRef = collection(db, "users", user.uid, "entries");
        const q = query(entriesRef, orderBy("date", "desc"));

        unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            const parsed: Entry[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              let timestamp = "";

              // Handle Firestore Timestamp
              if (data.date?.toDate) {
                // This is a Firestore Timestamp
                const date = data.date.toDate();
                timestamp = date.toISOString().split("T")[0]; // Extract just YYYY-MM-DD
              } else if (typeof data.date === "string") {
                // Already a string
                timestamp = data.date;
              } else if (data.date instanceof Date) {
                // JavaScript Date
                timestamp = data.date.toISOString().split("T")[0];
              }

              return {
                id: doc.id,
                flow: data.flow ?? "not_recorded",
                mood: data.mood ?? "not_recorded",
                pain: data.pain ?? "not_recorded",
                sleep: data.sleep ?? "not_recorded",
                timestamp,
              };
            });
            setEntries(parsed.slice(0, limit));
            setLoading(false);
          },
          (error) => {
            console.error("Error loading entries:", error);
            setLoading(false);
          },
        );
      } else {
        setLoading(false);
        setEntries([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [limit]);

  return { entries, loading };
};
