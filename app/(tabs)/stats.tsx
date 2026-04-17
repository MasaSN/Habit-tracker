import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { useState, useCallback } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function StatsScreen() {
  const [habits, setHabits] = useState<any[]>([]);
  const { bg, cardBg, textColor, subColor } = useTheme();

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
      if (date === expected) streak++;
      else break;
    }
    return streak;
  };

  const getWeeklyPercentage = () => {
    if (habits.length === 0) return 0;
    const last7Days = getLast7Days();
    let completed = 0;
    let total = habits.length * 7;
    habits.forEach((habit) => {
      last7Days.forEach((day) => {
        if (habit.completedDates.includes(day.date)) completed++;
      });
    });
    return Math.round((completed / total) * 100);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split("T")[0],
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        day: d.getDate(),
      });
    }
    return days;
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return "🥇";
    if (streak >= 7) return "🥈";
    if (streak >= 3) return "🥉";
    return null;
  };

  const last7Days = getLast7Days();

  const renderHabit = ({ item }: any) => {
    const streak = getStreak(item.completedDates);
    const total = item.completedDates.length;
    const badge = getStreakBadge(streak);

    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.habitName, { color: textColor }]}>
            {item.name}
          </Text>
          {badge && <Text style={styles.badge}>{badge}</Text>}
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: bg }]}>
            <Text style={styles.statNumber}>🔥 {streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: bg }]}>
            <Text style={styles.statNumber}>✅ {total}</Text>
            <Text style={styles.statLabel}>Total Done</Text>
          </View>
        </View>

        <View style={styles.weekRow}>
          {last7Days.map((day) => {
            const done = item.completedDates.includes(day.date);
            return (
              <View key={day.date} style={styles.dayCol}>
                <Text style={[styles.dayLabel, { color: subColor }]}>
                  {day.label}
                </Text>
                <View style={[styles.dayDot, done && styles.dayDotDone]}>
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: done ? "#fff" : textColor },
                    ]}
                  >
                    {day.day}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: textColor }]}>My Progress</Text>
      <Text style={[styles.subtitle, { color: subColor }]}>
        Keep going, you&apos;re doing great!
      </Text>
      <View style={styles.weeklyCard}>
        <Text style={styles.weeklyTitle}>This Week&apos;s Performance</Text>
        <Text style={styles.weeklyPercent}>{getWeeklyPercentage()}%</Text>
        <View style={styles.weeklyBarBg}>
          <View
            style={[
              styles.weeklyBarFill,
              { width: `${getWeeklyPercentage()}%` },
            ]}
          />
        </View>
        <Text style={styles.weeklySubtext}>
          of all habits completed this week
        </Text>
      </View>
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  habitName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  badge: { fontSize: 24 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
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
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCol: { alignItems: "center", gap: 4 },
  dayLabel: { fontSize: 11, color: "#999" },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  dayDotDone: { backgroundColor: "#6C63FF" },
  dayNumber: { fontSize: 12, color: "#333", fontWeight: "bold" },
  weeklyCard: {
    backgroundColor: "#6C63FF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  weeklyTitle: { color: "#fff", fontSize: 14, opacity: 0.8, marginBottom: 8 },
  weeklyPercent: { color: "#fff", fontSize: 48, fontWeight: "bold" },
  weeklyBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 8,
    marginVertical: 12,
  },
  weeklyBarFill: { height: 8, backgroundColor: "#fff", borderRadius: 8 },
  weeklySubtext: { color: "#fff", fontSize: 12, opacity: 0.8 },
});
