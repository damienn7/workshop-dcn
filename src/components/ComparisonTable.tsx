import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ComparisonTable({ rows }: { rows: { element: string; client: string; seller: string; impact?: number }[] }) {
  return (
    <View>
      {rows.map((r) => (
        <View key={r.element} style={styles.row}>
          <Text style={styles.element}>{r.element}</Text>
          <Text>Client: {r.client}</Text>
          <Text>Vendeur: {r.seller}</Text>
          <Text>Impact: €{r.impact ?? 0}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { padding: 12, backgroundColor: '#fff', marginBottom: 8, borderRadius: 8 }, element: { fontWeight: '700', marginBottom: 6 } });
