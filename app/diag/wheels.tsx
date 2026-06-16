import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import ChoiceButton from '../../src/components/ChoiceButton';
import BottomActionBar from '../../src/components/BottomActionBar';
import { useDiagnosticStore } from '../../src/store/diagnosticStore';
import { useRouter } from 'expo-router';

export default function Wheels() {
  const setCategory = useDiagnosticStore((s) => s.setCategory);
  const categories = useDiagnosticStore((s) => s.categories);
  const router = useRouter();
  const current = categories.wheels;

  return (
    <View style={styles.container}>
      <AppHeader title="Roues & Pneus" />
      <View style={styles.content}>
        <Text style={styles.h1}>État des roues et pneus</Text>
        <ChoiceButton label="Bon état" selected={current.status === 'good'} onPress={() => setCategory('wheels', { status: 'good', impact: 0 })} />
        <ChoiceButton label="Usure moyenne" selected={current.status === 'medium'} onPress={() => setCategory('wheels', { status: 'medium', impact: 8 })} />
        <ChoiceButton label="À remplacer" selected={current.status === 'replace'} onPress={() => setCategory('wheels', { status: 'replace', impact: 25 })} />
      </View>
      <BottomActionBar onBack={() => router.back()} onNext={() => router.push('/diag/finishes')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f6f7' }, content: { padding: 16 }, h1: { fontWeight: '700', marginBottom: 8 } });
