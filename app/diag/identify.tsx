import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import ChoiceButton from '../../src/components/ChoiceButton';
import BottomActionBar from '../../src/components/BottomActionBar';
import { useRouter } from 'expo-router';
import { useDiagnosticStore } from '../../src/store/diagnosticStore';

export default function Identify() {
  const router = useRouter();
  const bikeType = useDiagnosticStore((s) => s.bikeType);
  const setDossier = useDiagnosticStore((s) => s.setDossier);

  return (
    <View style={styles.container}>
      <AppHeader title="Identification" />
      <View style={styles.content}>
        <Text style={styles.h1}>Type de vélo</Text>
        <ChoiceButton label="Vélo mécanique" selected={bikeType === 'mechanical'} onPress={() => setDossier('current', 'mechanical')} />
        <ChoiceButton label="Vélo électrique" selected={bikeType === 'electric'} onPress={() => setDossier('current', 'electric')} />
      </View>
      <BottomActionBar onBack={() => router.back()} onNext={() => router.push('/diag/frame')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f6f7' }, content: { padding: 16 }, h1: { fontSize: 16, fontWeight: '700', marginBottom: 8 } });
