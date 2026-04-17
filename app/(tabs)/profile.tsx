import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function ProfileScreen() {
  const [habitCount, setHabitCount] = useState(0);
  const { darkMode, setDarkMode, bg, cardBg, textColor, subColor } = useTheme();
  const user = auth.currentUser;

  useEffect(() => {
    loadHabitCount();
  }, []);

  const loadHabitCount = async () => {
    try {
      if (!user) return;
      const snapshot = await getDocs(
        collection(db, "users", user.uid, "habits"),
      );
      setHabitCount(snapshot.size);
    } catch (error) {
      console.log("Error loading habit count", error);
    }
  };

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

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: textColor }]}>My Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.email, { color: textColor }]}>{user?.email}</Text>
      </View>

      {/* Stats Card */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: subColor }]}>
            Total Habits
          </Text>
          <Text style={[styles.statValue, { color: textColor }]}>
            {habitCount}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: subColor }]}>
            Member Since
          </Text>
          <Text style={[styles.statValue, { color: textColor }]}>
            {user?.metadata?.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString()
              : "N/A"}
          </Text>
        </View>
      </View>

      {/* Dark Mode */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: subColor }]}>
            🌙 Dark Mode
          </Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#ddd", true: "#6C63FF" }}
            thumbColor={darkMode ? "#fff" : "#fff"}
          />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 60, marginBottom: 32 },
  avatarContainer: { alignItems: "center", marginBottom: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, color: "#fff", fontWeight: "bold" },
  email: { fontSize: 16 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: 15 },
  statValue: { fontSize: 15, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 12 },
  logoutButton: {
    backgroundColor: "#fff0f0",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffcccc",
  },
  logoutText: { color: "#ff4444", fontSize: 16, fontWeight: "bold" },
});
