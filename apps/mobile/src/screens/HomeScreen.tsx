import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, User</Text>
          <Text style={styles.subtitle}>Your Financial Dashboard</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pre-Approved Loan</Text>
          <Text style={styles.cardAmount}>₹10,00,000</Text>
          <Text style={styles.cardSubtitle}>Based on your verified profile</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Claim Now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Quick Apply</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridItemText}>Vehicle Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridItemText}>Home Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridItemText}>Personal Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridItemText}>Business Credit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  card: { backgroundColor: '#10b981', borderRadius: 16, padding: 20, marginBottom: 32 },
  cardTitle: { color: '#ecfdf5', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  cardAmount: { color: 'white', fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  cardSubtitle: { color: '#a7f3d0', fontSize: 13, marginBottom: 16 },
  button: { backgroundColor: 'white', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#10b981', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', backgroundColor: 'white', padding: 24, borderRadius: 12, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  gridItemText: { fontWeight: '600', color: '#334155' },
});
