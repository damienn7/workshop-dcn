import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function ChoiceButton({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity style={[styles.btn, selected && styles.selected]} onPress={onPress}>
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ btn: { padding: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6e6e6', marginBottom: 8 }, selected: { borderColor: colors.primary, backgroundColor: '#eaf4ff' }, text: { color: '#222' }, textSelected: { color: colors.primary, fontWeight: '700' } });
