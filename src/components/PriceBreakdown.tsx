import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PriceBreakdown({ base, repair, cleaning, final }: { base: number; repair: number; cleaning: number; final: number }) {
  return (
    <View style={styles.container}>
      <Text>Valeur argus: €{base}</Text>
      <Text>Frais réparation: €{repair}</Text>
      <Text>Frais nettoyage: €{cleaning}</Text>
      <Text style={styles.final}>Offre finale: €{final}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 12, backgroundColor: '#f7f7f7', borderRadius: 8 }, final: { marginTop: 8, fontWeight: '700' } });
