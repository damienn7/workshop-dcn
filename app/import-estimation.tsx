import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import AppButton from '../src/components/AppButton';
import { mockEstimations } from '../src/data/mockEstimations';

const schema = z.object({ id: z.string().min(1) });

export default function ImportEstimation() {
  const { control, handleSubmit } = useForm({ defaultValues: { id: '' } });
  const router = useRouter();

  function onSubmit(data: any) {
    const id = data.id.trim();
    if (mockEstimations[id]) {
      router.push(`/estimation/${id}`);
    } else {
      alert('Aucun dossier trouvé pour cet identifiant.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Importer une estimation client</Text>
      <Controller
        control={control}
        name="id"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Numéro de dossier" value={value} onChangeText={onChange} />
        )}
      />
      <AppButton title="Charger l'estimation" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 12 }
});
