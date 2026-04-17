import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useTheme } from "../../context/ThemeContext";

export default function AddScreen() {
  const [habitName, setHabitName] = useState("");
  const { bg, cardBg, textColor, subColor } = useTheme();

  const saveHabit = async () => {
    if (habitName.trim() === "") {
      Alert.alert("Oops!", "Please enter a habit name.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "users", user.uid, "habits"), {
        name: habitName,
        completedDates: [],
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success!", `"${habitName}" added!`);
      setHabitName("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: bg }]}>
        <Text style={[styles.title, { color: textColor }]}>Add a Habit</Text>

        <TextInput
          style={[styles.input, { borderColor: cardBg, backgroundColor: cardBg, color: textColor }]}
          placeholder="e.g. Drink water, Read 10 pages..."
          placeholderTextColor={subColor}
          value={habitName}
          onChangeText={setHabitName}
        />

        <TouchableOpacity style={styles.button} onPress={saveHabit}>
          <Text style={styles.buttonText}>Add Habit</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 60, marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
