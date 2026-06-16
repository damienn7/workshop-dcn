import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSearchParams, useRouter } from 'expo-router';
import AppButton from '../../src/components/AppButton';
import { mockEstimations } from '../../src/data/mockEstimations';

export default function EstimationDetail() {
  const { id } = useSearchParams();
  const router = useRouter();
  const estimation = id ? mockEstimations[id as string] : null;

  if (!estimation) {
    return (
      <View style={styles.container}>
        <Text>Dossier introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Résumé de l'estimation</Text>
      <Text>Type: {estimation.type}</Text>
      <Text>Marque: {estimation.brand}</Text>
      <Text>Modèle: {estimation.model}</Text>
      <Text>Année: {estimation.year}</Text>
      <Text>État déclaré: {estimation.declaredCondition}</Text>
      <Text>Prix estimé en ligne: €{estimation.estimatedPrice}</Text>
      <Text style={styles.notice}>Cette estimation est indicative. Le prix final dépend du diagnostic réalisé en magasin.</Text>
      <AppButton title="Vérifier le vélo" onPress={() => router.push(`/diagnostic/setup?est=${id}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  notice: { marginTop: 12, fontStyle: 'italic' }
});
