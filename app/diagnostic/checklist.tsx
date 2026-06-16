import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import DiagnosticItemCard from '../../src/components/DiagnosticItemCard';
import AppButton from '../../src/components/AppButton';
import { DEFAULT_CHECKLIST } from '../../src/data/mockEstimations';
import { useRouter, useSearchParams } from 'expo-router';

export default function Checklist() {
  const router = useRouter();
  const params = useSearchParams();
  const items = DEFAULT_CHECKLIST;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checklist diagnostique</Text>
      <FlatList data={items} keyExtractor={(i) => i.id} renderItem={({ item }) => <DiagnosticItemCard item={item} />} />
      <AppButton title="Continuer" onPress={() => router.push('/result')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 18, fontWeight: '700', marginBottom: 12 } });
