import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import ChoiceButton from '../../src/components/ChoiceButton';
import BottomActionBar from '../../src/components/BottomActionBar';
import { useDiagnosticStore } from '../../src/store/diagnosticStore';
import { useRouter } from 'expo-router';

export default function Finishes() {
  const setCategory = useDiagnosticStore((s) => s.setCategory);
  const categories = useDiagnosticStore((s) => s.categories);
  const router = useRouter();
  const current = categories.finishes;

  return (
    <View style={styles.container}>
      <AppHeader title="Finitions" />
      <View style={styles.content}>
        <Text style={styles.h1}>Finitions & propreté</Text>
        <ChoiceButton label="Propre" selected={current.status === 'good'} onPress={() => setCategory('finishes', { status: 'good', impact: 0 })} />
        <ChoiceButton label="État moyen" selected={current.status === 'medium'} onPress={() => setCategory('finishes', { status: 'medium', impact: 5 })} />
        <ChoiceButton label="Nécessite nettoyage" selected={current.status === 'replace'} onPress={() => setCategory('finishes', { status: 'replace', impact: 8 })} />
      </View>
      <BottomActionBar onBack={() => router.back()} onNext={() => router.push('/diag/summary')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f6f7' }, content: { padding: 16 }, h1: { fontWeight: '700', marginBottom: 8 } });
