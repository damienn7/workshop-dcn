import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ScoreCircle({ score }: { score: number }) {
  return (
    <View style={styles.circle}>
      <Text style={styles.score}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ circle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#007aff', alignItems: 'center', justifyContent: 'center', marginVertical: 12 }, score: { color: '#fff', fontSize: 28, fontWeight: '700' } });
