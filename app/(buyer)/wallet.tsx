import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Colors } from '../../src/constants/colors';
import { getWallet, getWalletTransactions, topUpWallet } from '../../src/api/wallet';
import type { WalletTransaction } from '../../src/types';

const TOPUP_AMOUNTS = [50, 100, 200, 500];

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: getWallet,
  });

  const { data: txData } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => getWalletTransactions({ limit: 20 }),
  });

  const topUpMutation = useMutation({
    mutationFn: (amount: number) => topUpWallet(amount),
    onSuccess: (res) => {
      if (res.message) Alert.alert('تم ✅', res.message);
    },
    onError: () => Alert.alert('خطأ', 'تعذّر الشحن، حاول مجدداً'),
  });

  const handleTopUp = () => {
    const amount = selectedAmount ?? Number(customAmount);
    if (!amount || amount <= 0) return Alert.alert('تنبيه', 'أدخل مبلغاً صحيحاً');
    Alert.alert('شحن المحفظة', `شحن ${amount} AED؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تأكيد', onPress: () => topUpMutation.mutate(amount) },
    ]);
  };

  const txIcon = (type: string) =>
    type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle';
  const txColor = (type: string) =>
    type === 'credit' ? Colors.success : Colors.error;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>محفظتي</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>رصيدك الحالي</Text>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.balanceAmount}>
              {(wallet?.balance ?? 0).toFixed(2)}
              <Text style={styles.balanceCurrency}> AED</Text>
            </Text>
          )}
        </View>

        {/* Top-up Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>شحن المحفظة</Text>
          <View style={styles.amountsRow}>
            {TOPUP_AMOUNTS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.amountBtn, selectedAmount === a && styles.amountBtnActive]}
                onPress={() => { setSelectedAmount(a); setCustomAmount(''); }}
              >
                <Text style={[styles.amountBtnText, selectedAmount === a && styles.amountBtnTextActive]}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.customInput}
            placeholder="أو أدخل مبلغاً مخصصاً"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={(v) => { setCustomAmount(v); setSelectedAmount(null); }}
            textAlign="right"
          />
          <TouchableOpacity
            style={[styles.topUpBtn, topUpMutation.isPending && { opacity: 0.6 }]}
            onPress={handleTopUp}
            disabled={topUpMutation.isPending}
          >
            {topUpMutation.isPending
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.topUpBtnText}>شحن الآن</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آخر المعاملات</Text>
          {(txData?.transactions ?? []).length === 0 ? (
            <View style={styles.emptyTx}>
              <Ionicons name="receipt-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyTxText}>لا توجد معاملات بعد</Text>
            </View>
          ) : (
            txData?.transactions.map((tx: WalletTransaction) => (
              <View key={tx.id} style={styles.txItem}>
                <View style={styles.txLeft}>
                  <Text style={[styles.txAmount, { color: txColor(tx.type) }]}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount} AED
                  </Text>
                  <Text style={styles.txDate}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('ar-AE') : ''}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                  <Ionicons name={txIcon(tx.type) as any} size={20} color={txColor(tx.type)} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.cardBg,
  },
  backBtn: { width: 40, alignItems: 'flex-end' },
  headerTitle: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: Colors.textPrimary },
  balanceCard: {
    margin: 16, borderRadius: 20, padding: 28, alignItems: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  balanceLabel: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  balanceAmount: { fontFamily: 'Cairo_700Bold', fontSize: 42, color: '#fff' },
  balanceCurrency: { fontFamily: 'Cairo_400Regular', fontSize: 18, color: 'rgba(255,255,255,0.8)' },
  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: Colors.textPrimary, textAlign: 'right', marginBottom: 12 },
  amountsRow: { flexDirection: 'row', gap: 10, marginBottom: 12, justifyContent: 'flex-end' },
  amountBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.cardBg,
  },
  amountBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.lightPurple },
  amountBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textPrimary },
  amountBtnTextActive: { color: Colors.primary },
  customInput: {
    backgroundColor: Colors.cardBg, borderRadius: 12, padding: 14,
    fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  topUpBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, padding: 16,
    alignItems: 'center',
  },
  topUpBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: '#fff' },
  emptyTx: { alignItems: 'center', gap: 8, padding: 24 },
  emptyTxText: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.textMuted },
  txItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.cardBg, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  txLeft: { alignItems: 'flex-start', gap: 4 },
  txRight: { alignItems: 'flex-end', gap: 4, flex: 1, marginRight: 12 },
  txAmount: { fontFamily: 'Cairo_700Bold', fontSize: 16 },
  txDate: { fontFamily: 'Cairo_400Regular', fontSize: 11, color: Colors.textMuted },
  txDesc: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: Colors.textPrimary, textAlign: 'right' },
});
