import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AppButton({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ btn: { backgroundColor: '#007aff', padding: 12, borderRadius: 8, marginBottom: 8 }, text: { color: '#fff', textAlign: 'center', fontWeight: '600' } });
