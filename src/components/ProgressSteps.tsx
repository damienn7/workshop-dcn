import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function ProgressSteps({ step, total }: { step: number; total: number }) {
  const percent = Math.round((step / total) * 100);
  return (
    <View style={{ marginVertical: 10 }}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.label}>Étape {step} / {total} ({percent}%)</Text>
    </View>
  );
}

const styles = StyleSheet.create({ barBackground: { height: 8, backgroundColor: '#eee', borderRadius: 8, overflow: 'hidden' }, barFill: { height: 8, backgroundColor: colors.primary }, label: { marginTop: 6, fontSize: 12, color: '#666' } });
