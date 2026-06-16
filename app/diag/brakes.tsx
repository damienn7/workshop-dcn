import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import ChoiceButton from '../../src/components/ChoiceButton';
import BottomActionBar from '../../src/components/BottomActionBar';
import { useDiagnosticStore } from '../../src/store/diagnosticStore';
import { useRouter } from 'expo-router';

export default function Brakes() {
  const setCategory = useDiagnosticStore((s) => s.setCategory);
  const categories = useDiagnosticStore((s) => s.categories);
  const router = useRouter();
  const current = categories.brakes;

  return (
    <View style={styles.container}>
      <AppHeader title="Freins" />
      <View style={styles.content}>
        <Text style={styles.h1}>État des freins</Text>
        <ChoiceButton label="Bon état" selected={current.status === 'good'} onPress={() => setCategory('brakes', { status: 'good', impact: 0 })} />
        <ChoiceButton label="Usure moyenne" selected={current.status === 'medium'} onPress={() => setCategory('brakes', { status: 'medium', impact: 12 })} />
        <ChoiceButton label="À remplacer" selected={current.status === 'replace'} onPress={() => setCategory('brakes', { status: 'replace', impact: 30 })} />
        <ChoiceButton label="Critique" selected={current.status === 'critical'} onPress={() => setCategory('brakes', { status: 'critical', impact: 0, blocking: true })} />
      </View>
      <BottomActionBar onBack={() => router.back()} onNext={() => router.push('/diag/transmission')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f6f7' }, content: { padding: 16 }, h1: { fontWeight: '700', marginBottom: 8 } });
