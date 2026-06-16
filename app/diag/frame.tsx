import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import ChoiceButton from '../../src/components/ChoiceButton';
import BottomActionBar from '../../src/components/BottomActionBar';
import { useDiagnosticStore } from '../../src/store/diagnosticStore';
import { useRouter } from 'expo-router';

export default function Frame() {
  const setCategory = useDiagnosticStore((s) => s.setCategory);
  const categories = useDiagnosticStore((s) => s.categories);
  const router = useRouter();
  const current = categories.frame;

  return (
    <View style={styles.container}>
      <AppHeader title="Cadre & Fourche" />
      <View style={styles.content}>
        <Text style={styles.h1}>État du cadre</Text>
        <ChoiceButton label="Bon état" selected={current.status === 'good'} onPress={() => setCategory('frame', { status: 'good', impact: 0 })} />
        <ChoiceButton label="Usure moyenne" selected={current.status === 'medium'} onPress={() => setCategory('frame', { status: 'medium', impact: 10 })} />
        <ChoiceButton label="À remplacer" selected={current.status === 'replace'} onPress={() => setCategory('frame', { status: 'replace', impact: 50 })} />
        <ChoiceButton label="Critique (choc)" selected={current.status === 'critical'} onPress={() => setCategory('frame', { status: 'critical', impact: 0, blocking: true })} />
      </View>
      <BottomActionBar onBack={() => router.back()} onNext={() => router.push('/diag/brakes')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f6f7' }, content: { padding: 16 }, h1: { fontWeight: '700', marginBottom: 8 } });
