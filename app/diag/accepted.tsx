import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../src/components/AppHeader';

export default function Accepted() {
  return (
    <View style={styles.container}>
      <AppHeader title="Reprise acceptée" />
      <View style={styles.content}>
        <Text style={styles.h1}>Offre acceptée</Text>
        <Text>Le vélo est accepté pour reprise. Merci !</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex:1, backgroundColor:'#f5f6f7' }, content: { padding:16 }, h1: { fontWeight:'700', marginBottom:8 } });
