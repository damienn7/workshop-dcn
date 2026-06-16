import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import ChoiceButton from '../../src/components/ChoiceButton';
import BottomActionBar from '../../src/components/BottomActionBar';
import { useDiagnosticStore } from '../../src/store/diagnosticStore';
import { useRouter } from 'expo-router';

export default function Transmission() {
  const setCategory = useDiagnosticStore((s) => s.setCategory);
  const categories = useDiagnosticStore((s) => s.categories);
  const router = useRouter();
  const current = categories.transmission;

  return (
    <View style={styles.container}>
      <AppHeader title="Transmission" />
      <View style={styles.content}>
        <Text style={styles.h1}>État de la transmission</Text>
        <ChoiceButton label="Bon état" selected={current.status === 'good'} onPress={() => setCategory('transmission', { status: 'good', impact: 0 })} />
        <ChoiceButton label="Usure moyenne" selected={current.status === 'medium'} onPress={() => setCategory('transmission', { status: 'medium', impact: 15 })} />
        <ChoiceButton label="Remplacer chaine/cassette" selected={current.status === 'replace'} onPress={() => setCategory('transmission', { status: 'replace', impact: 40 })} />
        <ChoiceButton label="Critique" selected={current.status === 'critical'} onPress={() => setCategory('transmission', { status: 'critical', impact: 0, blocking: true })} />
      </View>
      <BottomActionBar onBack={() => router.back()} onNext={() => router.push('/diag/wheels')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f6f7' }, content: { padding: 16 }, h1: { fontWeight: '700', marginBottom: 8 } });
