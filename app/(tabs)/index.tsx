import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { router, useFocusEffect } from "expo-router";
import { signOut } from "firebase/auth";
import { useTheme } from "../../context/ThemeContext";
import ConfettiCannon from "react-native-confetti-cannon";
import { useRef } from "react";

export default function HomeScreen() {
  const [habits, setHabits] = useState<any[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const { bg, cardBg, textColor, subColor } = useTheme();
  const confettiRef = useRef<any>(null);

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

  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/login" as any);
        },
      },
    ]);
  };

  const toggleHabit = async (id: string, completedDates: string[]) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const alreadyDone = completedDates.includes(today);
      const updated = alreadyDone
        ? completedDates.filter((d) => d !== today)
        : [...completedDates, today];

      const ref = doc(db, "users", user.uid, "habits", id);
      await updateDoc(ref, { completedDates: updated });
      await loadHabits();

      // Fire confetti if all habits are done
      if (!alreadyDone) {
        const updatedHabits = habits.map((h) =>
          h.id === id ? { ...h, completedDates: updated } : h,
        );
        const allDone = updatedHabits.every((h) =>
          h.completedDates.includes(today),
        );
        if (allDone) confettiRef.current?.start();
      }
    } catch (error) {
      console.log("Error toggling habit", error);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "habits", id));
      loadHabits();
    } catch (error) {
      console.log("Error deleting habit", error);
    }
  };

  const renderHabit = ({ item }: any) => {
    const done = item.completedDates.includes(today);
    return (
      <View style={[styles.habitCard, { backgroundColor: cardBg }]}>
        <TouchableOpacity
          style={styles.habitLeft}
          onPress={() => toggleHabit(item.id, item.completedDates)}
        >
          <View style={[styles.checkbox, done && styles.checkboxDone]}>
            {done && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.habitName, done && styles.habitNameDone]}>
            {item.name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteHabit(item.id)}>
          <Text style={styles.delete}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>
            Today&apos;s Habits
          </Text>
          <Text style={[styles.date, { color: subColor }]}>
            {new Date().toDateString()}
          </Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutBtn}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
      {habits.length > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {habits.filter((h) => h.completedDates.includes(today)).length}/
            {habits.length} completed today
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(habits.filter((h) => h.completedDates.includes(today)).length / habits.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      )}
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
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: 200, y: 0 }}
        autoStart={false}
        fadeOut={true}
        colors={["#6C63FF", "#FF6584", "#43D9AD", "#FFD166"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: "bold" },
  date: { fontSize: 14, color: "#999" },
  empty: { textAlign: "center", marginTop: 80, fontSize: 16, color: "#aaa" },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
  },
  habitLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#6C63FF",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: "#6C63FF" },
  checkmark: { color: "#fff", fontWeight: "bold" },
  habitName: { fontSize: 16, color: "#333" },
  habitNameDone: { textDecorationLine: "line-through", color: "#aaa" },
  delete: { fontSize: 20 },
  logoutBtn: { fontSize: 14, color: "#ff4444" },
  progressContainer: { marginBottom: 20 },
  progressText: { fontSize: 14, color: "#666", marginBottom: 8 },
  progressBarBg: { height: 10, backgroundColor: "#eee", borderRadius: 10 },
  progressBarFill: { height: 10, backgroundColor: "#6C63FF", borderRadius: 10 },
});
