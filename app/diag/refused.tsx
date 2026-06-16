import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../src/components/AppHeader';

export default function Refused() {
  return (
    <View style={styles.container}>
      <AppHeader title="Reprise refusée" />
      <View style={styles.content}>
        <Text style={styles.h1}>Offre refusée</Text>
        <Text>La reprise n'est pas possible suite au diagnostic.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex:1, backgroundColor:'#f5f6f7' }, content: { padding:16 }, h1: { fontWeight:'700', marginBottom:8 } });
