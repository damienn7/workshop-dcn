import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DiagnosticItemCard({ item }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.label}</Text>
      <Text>État déclaré client: {item.declared}</Text>
      <Text>État constaté vendeur: {item.seller || '—'}</Text>
      <Text>Impact prix: €{item.impact || 0}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ card: { padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 8, borderWidth: 1, borderColor: '#eee' }, title: { fontWeight: '700', marginBottom: 6 } });
