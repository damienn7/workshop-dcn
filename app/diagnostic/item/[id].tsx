import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSearchParams, useRouter } from 'expo-router';
import AppButton from '../../../src/components/AppButton';

export default function ItemDetail() {
  const { id } = useSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détail : {id}</Text>
      <Text>Choisir l'état constaté :</Text>
      <View style={{ marginTop: 12 }}>
        <AppButton title="Bon état" onPress={() => router.back()} />
        <AppButton title="Usure moyenne" onPress={() => router.back()} />
        <AppButton title="À remplacer" onPress={() => router.back()} />
        <AppButton title="Critique" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 18, fontWeight: '700', marginBottom: 8 } });
