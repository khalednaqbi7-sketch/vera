import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../src/constants/colors';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../src/api/notifications';
import type { Notification } from '../../src/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications({ limit: 50 }),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const iconForType = (type?: string) => {
    switch (type) {
      case 'order': return 'receipt-outline';
      case 'payment': return 'card-outline';
      case 'promo': return 'pricetag-outline';
      default: return 'notifications-outline';
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.item, !item.isRead && styles.itemUnread]}
      onPress={() => {
        if (!item.isRead) readMutation.mutate(item.id);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, !item.isRead && styles.iconWrapUnread]}>
        <Ionicons name={iconForType(item.type) as any} size={20} color={item.isRead ? Colors.textMuted : Colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.body && (
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        )}
        <Text style={styles.time}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-AE') : ''}
        </Text>
      </View>
      {!item.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          الإشعارات {unreadCount > 0 ? `(${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={() => readAllMutation.mutate()} style={styles.readAllBtn}>
            <Text style={styles.readAllText}>قراءة الكل</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
          <Text style={styles.emptySubtitle}>ستظهر إشعاراتك هنا</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
        />
      )}
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
  readAllBtn: { paddingHorizontal: 8 },
  readAllText: { fontFamily: 'Cairo_600SemiBold', fontSize: 13, color: Colors.primary },
  list: { padding: 12, gap: 8 },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.cardBg, borderRadius: 14, padding: 14,
  },
  itemUnread: { backgroundColor: Colors.lightPurple, borderWidth: 1, borderColor: Colors.border },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  iconWrapUnread: { backgroundColor: `${Colors.primary}15` },
  content: { flex: 1 },
  title: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textPrimary, textAlign: 'right', marginBottom: 4 },
  titleUnread: { fontFamily: 'Cairo_700Bold', color: Colors.textPrimary },
  body: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'right', marginBottom: 4 },
  time: { fontFamily: 'Cairo_400Regular', fontSize: 11, color: Colors.textMuted, textAlign: 'right' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: Colors.textPrimary },
  emptySubtitle: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.textMuted },
});
