import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { Colors } from '../../src/constants/colors';
import { buyerPost } from '../../src/api/client';

const FAQS = [
  { q: 'كيف أتتبع طلبي؟', a: 'اذهب إلى صفحة "طلباتي" للاطلاع على حالة جميع طلباتك ومراحلها.' },
  { q: 'هل يمكنني إلغاء طلبي؟', a: 'يمكن إلغاء الطلب خلال 24 ساعة من تاريخ الإنشاء في حال لم يبدأ تنفيذه.' },
  { q: 'كيف أستخدم رصيد المحفظة؟', a: 'عند إتمام الدفع في الخروج، اختر "محفظة VÉRA" كطريقة دفع.' },
  { q: 'ما هي بوابات الدفع المتاحة؟', a: 'نقبل Stripe (بطاقة ائتمان)، Tabby، وTamara للدفع بالتقسيط.' },
];

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sendMutation = useMutation({
    mutationFn: () => buyerPost('/api/buyer/support', { subject, message }),
    onSuccess: () => {
      Alert.alert('تم الإرسال ✅', 'سيتم الرد عليك خلال 24 ساعة');
      setSubject('');
      setMessage('');
    },
    onError: () => Alert.alert('خطأ', 'تعذّر إرسال الرسالة، حاول مجدداً'),
  });

  const handleSend = () => {
    if (!subject.trim()) return Alert.alert('تنبيه', 'الرجاء إدخال الموضوع');
    if (!message.trim()) return Alert.alert('تنبيه', 'الرجاء كتابة رسالتك');
    sendMutation.mutate();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الدعم والمساعدة</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تواصل معنا</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('mailto:support@veraapp.app')}>
              <Ionicons name="mail-outline" size={22} color={Colors.primary} />
              <Text style={styles.contactText}>البريد الإلكتروني</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('https://wa.me/971000000000')}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
              <Text style={styles.contactText}>واتساب</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأسئلة الشائعة</Text>
          {FAQS.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={styles.faqItem}
              onPress={() => setOpenFaq(openFaq === i ? null : i)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Ionicons
                  name={openFaq === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.textMuted}
                />
                <Text style={styles.faqQ}>{faq.q}</Text>
              </View>
              {openFaq === i && (
                <Text style={styles.faqA}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أرسل رسالة</Text>
          <TextInput
            style={styles.input}
            placeholder="الموضوع"
            placeholderTextColor={Colors.textMuted}
            value={subject}
            onChangeText={setSubject}
            textAlign="right"
          />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="اكتب رسالتك هنا..."
            placeholderTextColor={Colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlign="right"
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.sendBtn, sendMutation.isPending && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={sendMutation.isPending}
          >
            {sendMutation.isPending
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.sendBtnText}>إرسال</Text>
            }
          </TouchableOpacity>
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
  section: { marginHorizontal: 16, marginTop: 20, marginBottom: 4 },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: Colors.textPrimary, textAlign: 'right', marginBottom: 12 },
  contactRow: { flexDirection: 'row', gap: 12 },
  contactBtn: {
    flex: 1, backgroundColor: Colors.cardBg, borderRadius: 14, padding: 16,
    alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  contactText: { fontFamily: 'Cairo_600SemiBold', fontSize: 13, color: Colors.textPrimary },
  faqItem: { backgroundColor: Colors.cardBg, borderRadius: 12, padding: 14, marginBottom: 8 },
  faqHeader: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8 },
  faqQ: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textPrimary, flex: 1, textAlign: 'right' },
  faqA: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: Colors.textMuted, marginTop: 10, textAlign: 'right', lineHeight: 22 },
  input: {
    backgroundColor: Colors.cardBg, borderRadius: 12, padding: 14,
    fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  textarea: { height: 120, textAlignVertical: 'top' },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  sendBtnText: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: '#fff' },
});
