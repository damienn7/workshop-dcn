import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScoreCircle from '../src/components/ScoreCircle';
import { sampleResult } from '../src/domain/scoringEngine';

export default function Result() {
  const r = sampleResult();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Résultat du diagnostic</Text>
      <ScoreCircle score={r.score} />
      <Text style={styles.decision}>Décision : {r.decision}</Text>
      <Text>Estimation en ligne: €{r.base}</Text>
      <Text>Offre finale magasin: €{r.finalOffer}</Text>
      <Text>Frais de réparation: €{r.repairCosts}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 12 }, decision: { marginVertical: 8, fontWeight: '700' } });
