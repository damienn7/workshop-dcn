import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatusBadge({ status }: { status: string }) {
  const color = status === 'conforme' ? '#28a745' : status === 'critique' ? '#dc3545' : '#ffc107';
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }, text: { color: '#fff', fontWeight: '700' } });
