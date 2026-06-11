import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';

const mockAssets = [
  { id: '1', type: 'Vehicle', name: 'Hyundai Creta 2023', value: '₹14,50,000', insuranceExpires: 'IN 14 DAYS' },
  { id: '2', type: 'Property', name: '2 BHK Apartment, Pune', value: '₹65,00,000', insuranceExpires: 'IN 8 MONTHS' }
];

export default function AssetLockerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Asset Locker</Text>
        <Text style={styles.subtitle}>Track your vehicles and properties</Text>
      </View>

      <FlatList
        data={mockAssets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.typeBadge}>{item.type}</Text>
              <Text style={styles.insuranceText}>{item.insuranceExpires}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.valueLabel}>Estimated Value</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add New Asset</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  list: { padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { backgroundColor: '#e2e8f0', color: '#475569', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  insuranceText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  valueLabel: { fontSize: 12, color: '#64748b' },
  value: { fontSize: 24, fontWeight: 'bold', color: '#10b981' },
  addButton: { padding: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', borderRadius: 12, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#64748b', fontWeight: 'bold', fontSize: 16 },
});
