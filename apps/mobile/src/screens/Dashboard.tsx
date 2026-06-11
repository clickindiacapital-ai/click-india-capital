import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { 
  ShieldCheck, 
  Wallet, 
  TrendingDown, 
  ChevronRight, 
  Car, 
  Home, 
  FileText,
  Bell,
  HeartPulse
} from 'lucide-react-native';
import { aiService } from '@click-india/shared-services';

const { width } = Dimensions.get('window');

const Dashboard = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Good Morning, Sameer</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Rehab Stage: Advisory</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Bell color="#94A3B8" size={20} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Savings Meter Card */}
      <View style={styles.savingsCard}>
        <View style={styles.savingsHeader}>
          <View>
            <Text style={styles.savingsTitle}>Potential Monthly Savings</Text>
            <Text style={styles.savingsAmount}>₹12,400</Text>
          </View>
          <View style={styles.savingsIcon}>
            <TrendingDown color="#10B981" size={28} />
          </View>
        </View>
        
        <View style={styles.meterContainer}>
          <View style={styles.meterBg}>
            <View style={[styles.meterFill, { width: '65%' }]} />
          </View>
          <Text style={styles.meterText}>Optimization Opportunity: 65% Identified</Text>
        </View>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>UNLOCk SAVINGS</Text>
          <ChevronRight color="#000" size={16} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ASSET LOCKER</Text>
        <View style={styles.assetGrid}>
          {[
            { 
              label: 'Vehicle', 
              icon: Car, 
              count: `₹${aiService.estimateAssetValue('VEHICLE', { year: 2021, originalPrice: 1200000 }).toLocaleString()}`, 
              color: '#3B82F6' 
            },
            { 
              label: 'Property', 
              icon: Home, 
              count: `₹${aiService.estimateAssetValue('PROPERTY', { sqft: 1200, cityRate: 6500 }).toLocaleString()}`, 
              color: '#8B5CF6' 
            },
            { label: 'Documents', icon: FileText, count: '4 Verified', color: '#10B981' },
            { label: 'Insurance', icon: ShieldCheck, count: 'Expires soon', color: '#F59E0B' },
          ].map((asset, i) => (
            <TouchableOpacity key={i} style={styles.assetCard}>
              <View style={[styles.assetIcon, { backgroundColor: `${asset.color}15` }]}>
                <asset.icon color={asset.color} size={24} />
              </View>
              <Text style={styles.assetLabel}>{asset.label}</Text>
              <Text style={styles.assetCount}>{asset.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recovery Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>YOUR RECOVERY JOURNEY</Text>
        <View style={styles.timelineCard}>
          {[
            { title: 'Debt Diagnosis', status: 'COMPLETED', date: 'Oct 12' },
            { title: 'Advisory Session', status: 'IN PROGRESS', date: 'Today' },
            { title: 'Strategy Blueprint', status: 'LOCKED', date: 'Pending' },
          ].map((step, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineVisual}>
                <View style={[styles.timelineDot, step.status === 'COMPLETED' && styles.dotCompleted]} />
                {i < 2 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, step.status === 'LOCKED' && styles.textMuted]}>{step.title}</Text>
                <Text style={styles.timelineDate}>{step.date} • {step.status}</Text>
              </View>
              {step.status === 'IN_PROGRESS' && <ChevronRight color="#3B82F6" size={20} />}
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  welcome: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 6,
  },
  statusText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  savingsCard: {
    backgroundColor: '#0A111F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  savingsTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  savingsAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  savingsIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meterContainer: {
    marginBottom: 24,
  },
  meterBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    marginBottom: 8,
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  meterText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
  },
  assetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  assetCard: {
    width: (width - 60) / 2,
    backgroundColor: '#0A111F',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  assetCount: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  timelineCard: {
    backgroundColor: '#0A111F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timelineVisual: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  dotCompleted: {
    backgroundColor: '#3B82F6',
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: '#1E293B',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timelineDate: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  textMuted: {
    color: '#334155',
  }
});

export default Dashboard;
