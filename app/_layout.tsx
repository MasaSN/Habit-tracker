import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/(tabs)' as any);
      } else {
        router.replace('/login' as any);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }} />
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        )}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});