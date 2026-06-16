import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function BottomActionBar({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.left} onPress={onBack}>
        <Text style={styles.leftText}>Retour</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.next} onPress={onNext}>
        <Text style={styles.nextText}>Suivant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' }, left: { flex: 1, justifyContent: 'center', alignItems: 'center' }, leftText: { color: colors.primary, fontWeight: '700' }, next: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }, nextText: { color: '#fff', fontWeight: '700' } });
