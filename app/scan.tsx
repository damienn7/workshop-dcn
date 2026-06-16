import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../src/components/AppHeader';
import AppButton from '../src/components/AppButton';
import { useRouter } from 'expo-router';

export default function Scan() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <AppHeader title="Scan estimation" />
      <View style={styles.content}>
        <Text style={styles.note}>Simulateur de scan QR — sélectionnez un dossier mock</Text>
        <AppButton title="Ouvrir DEC-00487 (Marie Dupont)" onPress={() => router.push('/dossier/DEC-00487')} />
        <AppButton title="Ouvrir DEC-00481 (Paul Rivière)" onPress={() => router.push('/dossier/DEC-00481')} />
        <AppButton title="Ouvrir DEC-00479 (Sophie Chen)" onPress={() => router.push('/dossier/DEC-00479')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f6f7' }, content: { padding: 16 }, note: { marginBottom: 12 } });
