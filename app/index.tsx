import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../src/components/AppButton';
import AppCard from '../src/components/AppCard';
import { mockStats } from '../src/data/mockEstimations';

export default function Home() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diag’Seconde Vie</Text>
      <View style={styles.actions}>
        <AppButton title="Démarrer un diagnostic" onPress={() => router.push('/diagnostic/setup')} />
        <AppButton title="Scanner une estimation client" onPress={() => router.push('/import-estimation')} />
      </View>

      <View style={styles.statsRow}>
        <AppCard title="Diagnostics du jour" value={`${mockStats.diagnosticsToday}`} />
        <AppCard title="Temps moyen" value={`${mockStats.avgTime} min`} />
        <AppCard title="Reprises acceptées" value={`${mockStats.acceptedRate}%`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  statsRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }
});
