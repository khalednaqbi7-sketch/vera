import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../src/constants/colors';
import { getWishlist, removeFromWishlist } from '../../src/api/services';
import type { Service } from '../../src/types';

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeFromWishlist(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const renderItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/service/${item.id}`)}
      activeOpacity={0.8}
    >
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeMutation.mutate(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="heart" size={22} color={Colors.error} />
      </TouchableOpacity>

      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={32} color={Colors.border} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.provider && (
          <Text style={styles.provider} numberOfLines={1}>{item.provider.name}</Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.price}>{item.price} {item.currency}</Text>
          {item.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المفضلة</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      ) : services.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>لا توجد خدمات في المفضلة</Text>
          <Text style={styles.emptySubtitle}>اضغط على قلب أي خدمة لحفظها هنا</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(buyer)')}>
            <Text style={styles.browseBtnText}>تصفح الخدمات</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={services}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  backBtn: { width: 40, alignItems: 'flex-end' },
  headerTitle: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: Colors.textPrimary },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadowColorDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  image: { width: 110, height: 110 },
  imagePlaceholder: { backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  title: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textPrimary, textAlign: 'right' },
  provider: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: Colors.textMuted, textAlign: 'right' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontFamily: 'Cairo_700Bold', fontSize: 15, color: Colors.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: Colors.textMuted },
  removeBtn: { position: 'absolute', top: 10, left: 10, zIndex: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: Colors.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  browseBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  browseBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: '#fff' },
});
