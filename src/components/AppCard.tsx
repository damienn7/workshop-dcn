import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppCard({ title, value }: { title: string; value?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {value && <Text style={styles.value}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({ card: { padding: 12, borderRadius: 8, backgroundColor: '#f8f8f8', marginBottom: 8, flex: 1, marginRight: 6 }, title: { fontWeight: '700' }, value: { marginTop: 6, fontSize: 16 } });
