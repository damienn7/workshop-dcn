import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import AppButton from '../../src/components/AppButton';
import { useDiagnosticStore } from '../../src/store/diagnosticStore';
import { mockEstimations } from '../../src/data/mockEstimations';
import { calculateScoreFromCategories } from '../../src/domain/scoringEngine';
import { useRouter } from 'expo-router';

export default function Decision() {
  const router = useRouter();
  const dossierId = useDiagnosticStore((s) => s.dossierId);
  const categories = useDiagnosticStore((s) => s.categories);
  const cleaningCosts = useDiagnosticStore((s) => s.cleaningCosts);
  const dossier = dossierId ? mockEstimations[dossierId] : null;

  if (dossierId === 'DEC-00487') {
    // fixed result
    const final = 58;
    const clientEst = 85;
    const reasons = [
      { label: 'Remplacement patins', value: 12 },
      { label: 'Nettoyage complet', value: 8 },
      { label: 'Réglage dérailleur', value: 10 },
      { label: 'Marge reconditionnement', value: 7 }
    ];
    return (
      <View style={styles.container}>
        <AppHeader title="Décision de reprise" />
        <View style={styles.content}>
          <Text style={styles.h1}>Reprise conditionnelle</Text>
          <Text>Estimation en ligne: €{clientEst}</Text>
          <Text>Offre finale magasin: €{final}</Text>
          <Text>Écarts:</Text>
          {reasons.map((r,i)=>(<Text key={i}>- {r.label}: -€{r.value}</Text>))}
          <View style={{height:12}} />
          <AppButton title="Confirmer reprise" onPress={() => router.push('/diag/accepted')} />
          <AppButton title="Refuser reprise" onPress={() => router.push('/diag/refused')} />
        </View>
      </View>
    );
  }

  const baseMarket = dossier ? (dossier.estimatedPrice || 100) : 100;
  const result = calculateScoreFromCategories({ baseMarketValue: baseMarket, categories, cleaningCosts });

  return (
    <View style={styles.container}>
      <AppHeader title="Décision de reprise" />
      <View style={styles.content}>
        <Text style={styles.h1}>Décision: {result.decision}</Text>
        <Text>Estimation en ligne: €{dossier?.estimatedPrice ?? '-'}</Text>
        <Text>Offre finale magasin: €{result.finalOffer}</Text>
        <Text>Frais réparation: €{result.repairCosts}</Text>
        <View style={{height:12}} />
        <AppButton title="Reprise acceptée" onPress={() => router.push('/diag/accepted')} />
        <AppButton title="Reprise refusée" onPress={() => router.push('/diag/refused')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex:1, backgroundColor:'#f5f6f7' }, content: { padding:16 }, h1: { fontWeight:'700', marginBottom:8 } });
