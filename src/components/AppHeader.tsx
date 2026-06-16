import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function AppHeader({ title }: { title?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title || "Diag' Seconde Vie"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: 14, paddingTop: 44 },
  title: { color: '#fff', fontWeight: '700', fontSize: 18 }
});
