import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from '../../src/components/AppButton';
import { useRouter, useSearchParams } from 'expo-router';

export default function ElectricSetup() {
  const router = useRouter();
  const { est } = useSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checklist spécifique vélo électrique</Text>
      <Text>- Batterie présente</Text>
      <Text>- Chargeur présent</Text>
      <Text>- Clés batterie</Text>
      <Text>- Kilométrage
</Text>
      <Text>- Code erreur
</Text>
      <Text>- Batterie endommagée</Text>

      <AppButton title="Continuer" onPress={() => router.push('/diagnostic/checklist')} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 18, fontWeight: '700', marginBottom: 12 } });
