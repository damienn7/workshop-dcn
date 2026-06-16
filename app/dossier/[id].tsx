import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import AppButton from '../../src/components/AppButton';
import { useSearchParams, useRouter } from 'expo-router';
import { mockEstimations } from '../../src/data/mockEstimations';
import { useDiagnosticStore } from '../../src/store/diagnosticStore';

export default function Dossier() {
  const { id } = useSearchParams();
  const router = useRouter();
  const setDossier = useDiagnosticStore((s) => s.setDossier);
  const dossier = id ? mockEstimations[id as string] : null;

  if (!dossier) return <View style={{flex:1}}><AppHeader title="Dossier introuvable" /></View>;

  return (
    <View style={styles.container}>
      <AppHeader title={`Dossier ${dossier.id}`} />
      <View style={styles.cardArea}>
        <Text style={styles.client}>{dossier.client}</Text>
        <Text>{dossier.brand} {dossier.model} ({dossier.year})</Text>
        <Text>km: {dossier.km}</Text>
        <Text>Score client: {dossier.clientScore}</Text>
        <Text>Estimation en ligne: €{dossier.estimatedPrice}</Text>
      </View>
      <View style={{padding:16}}>
        <AppButton title="Démarrer le diagnostic" onPress={() => { setDossier(dossier.id, dossier.type); router.push('/diag/identify'); }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f6f7' }, cardArea: { padding: 16 }, client: { fontWeight: '700', fontSize: 18, marginBottom: 6 } });
