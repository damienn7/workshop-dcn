import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { sampleComparison } from '../src/domain/scoringEngine';
import AppCard from '../src/components/AppCard';

export default function Comparison() {
  const items = sampleComparison();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comparatif client vs vendeur</Text>
      <FlatList data={items} keyExtractor={(i) => i.element} renderItem={({ item }) => <AppCard title={item.element} value={`Client: ${item.client} / Vendeur: ${item.seller} (-€${item.impact})`} />} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 18, fontWeight: '700', marginBottom: 12 } });
