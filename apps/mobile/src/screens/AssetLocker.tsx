import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { 
  ShieldCheck, 
  Car, 
  ChevronRight, 
  Plus,
  Clock,
  AlertCircle,
  FileText,
  Lock
} from 'lucide-react-native';

const AssetLocker = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Asset Vault</Text>
          <Text style={styles.subtitle}>Institutional-grade document security</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Plus color="#FFF" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <Lock color="#10B981" size={16} />
          <Text style={styles.securityText}>AES-256 BANK-GRADE ENCRYPTION ACTIVE</Text>
        </View>

        {/* Categories */}
        <View style={styles.categories}>
          {[
            { label: 'All', active: true },
            { label: 'Vehicles', active: false },
            { label: 'Property', active: false },
            { label: 'Tax & KYC', active: false },
          ].map((cat, i) => (
            <TouchableOpacity key={i} style={[styles.catBtn, cat.active && styles.catActive]}>
              <Text style={[styles.catText, cat.active && styles.catTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Asset List */}
        <View style={styles.list}>
          {/* Vehicle Card */}
          <View style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <View style={styles.typeIcon}>
                <Car color="#3B82F6" size={20} />
              </View>
              <View style={styles.assetInfo}>
                <Text style={styles.assetName}>Mahindra XUV700</Text>
                <Text style={styles.assetDetail}>MH 12 AB 1234 • White</Text>
              </View>
              <TouchableOpacity style={styles.moreBtn}>
                <ChevronRight color="#475569" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.docRow}>
              <View style={styles.docItem}>
                <FileText color="#94A3B8" size={14} />
                <Text style={styles.docLabel}>RC Copy</Text>
                <ShieldCheck color="#10B981" size={12} />
              </View>
              <View style={styles.docItem}>
                <ShieldCheck color="#94A3B8" size={14} />
                <Text style={styles.docLabel}>Insurance</Text>
                <View style={styles.alertDot} />
              </View>
            </View>

            <View style={styles.refinanceBanner}>
              <View>
                <Text style={styles.refinanceTitle}>Refinance Opportunity Identified</Text>
                <Text style={styles.refinanceDesc}>Potential to lower EMI by ₹3,200/mo</Text>
              </View>
              <TouchableOpacity style={styles.refinanceBtn}>
                <Text style={styles.refinanceBtnText}>VIEW OFFER</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Property Placeholder */}
          <TouchableOpacity style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Plus color="#334155" size={24} />
            </View>
            <Text style={styles.emptyTitle}>Add Property Asset</Text>
            <Text style={styles.emptyDesc}>Unlock Home Loan Top-up & LAP offers</Text>
          </TouchableOpacity>

          {/* KYC Card */}
          <View style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <View style={[styles.typeIcon, { backgroundColor: '#10B98115' }]}>
                <FileText color="#10B981" size={20} />
              </View>
              <View style={styles.assetInfo}>
                <Text style={styles.assetName}>Compliance Documents</Text>
                <Text style={styles.assetDetail}>PAN, Aadhar, 6m Statement</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>VERIFIED</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A111F',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  content: {
    padding: 24,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  securityText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  categories: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0A111F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  catActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  catText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  catTextActive: {
    color: '#FFF',
  },
  list: {
    gap: 20,
  },
  assetCard: {
    backgroundColor: '#0A111F',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3B82F615',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  assetDetail: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  docRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  docLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  refinanceBanner: {
    marginTop: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refinanceTitle: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  refinanceDesc: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  refinanceBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  refinanceBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  emptyCard: {
    height: 140,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A111F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyDesc: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#10B98115',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
  }
});

export default AssetLocker;
