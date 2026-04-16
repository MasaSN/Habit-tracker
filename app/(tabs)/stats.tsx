import { View, Text, FlatList, StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useFocusEffect } from "expo-router";

export default function StatsScreen() {
  const [habits, setHabits] = useState<any[]>([]);

  const loadHabits = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const snapshot = await getDocs(
        collection(db, "users", user.uid, "habits"),
      );
      const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHabits(loaded);
    } catch (error) {
      console.log("Error loading habits", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, []),
  );

  const getStreak = (completedDates: string[]) => {
    if (completedDates.length === 0) return 0;
    const sorted = [...completedDates].sort((a, b) => (a > b ? -1 : 1));
    let streak = 0;
    for (const date of sorted) {
      const d = new Date();
      d.setDate(d.getDate() - streak);
      const expected = d.toISOString().split("T")[0];
      if (date === expected) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const renderHabit = ({ item }: any) => {
    const streak = getStreak(item.completedDates);
    const total = item.completedDates.length;

    return (
      <View style={styles.card}>
        <Text style={styles.habitName}>{item.name}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>🔥 {streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>✅ {total}</Text>
            <Text style={styles.statLabel}>Total Done</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Progress</Text>
      <Text style={styles.subtitle}>Keep going, you&apos;re doing great!</Text>

      {habits.length === 0 ? (
        <Text style={styles.empty}>No habits yet! Go add some ✨</Text>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item: any) => item.id}
          renderItem={renderHabit}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 60, marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#999", marginBottom: 24 },
  empty: { textAlign: "center", marginTop: 80, fontSize: 16, color: "#aaa" },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#6C63FF" },
  statLabel: { fontSize: 12, color: "#999", marginTop: 4 },
});
