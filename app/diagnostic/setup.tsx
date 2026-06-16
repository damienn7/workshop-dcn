import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from '../../src/components/AppButton';
import { useRouter, useSearchParams } from 'expo-router';

export default function Setup() {
  const router = useRouter();
  const { est } = useSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Type de vélo</Text>
      <View style={{ marginBottom: 12 }}>
        <AppButton title="Vélo mécanique" onPress={() => router.push(`/diagnostic/checklist?type=mechanical${est ? `&est=${est}` : ''}`)} />
        <AppButton title="Vélo électrique" onPress={() => router.push(`/diagnostic/electric${est ? `?est=${est}` : ''}`)} />
      </View>

      <Text style={styles.title}>Mode</Text>
      <View style={{ marginTop: 8 }}>
        <AppButton title="Mode rapide" onPress={() => router.push('/diagnostic/checklist?mode=quick')} />
        <AppButton title="Mode guidé" onPress={() => router.push('/diagnostic/checklist?mode=guided')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 18, fontWeight: '700', marginBottom: 8 } });
