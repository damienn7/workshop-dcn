import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ClientSummary() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pourquoi ce prix ?</Text>
      <Text>Prix final proposé: €XXX</Text>
      <Text>Score d'état: XX/100</Text>
      <Text>Liste des déductions:</Text>
      <Text>- Usure pneus: -€XX</Text>
      <Text>- Transmission: -€XX</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 18, fontWeight: '700', marginBottom: 12 } });
