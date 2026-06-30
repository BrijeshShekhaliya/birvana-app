import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '@/theme/useTokens';

export const NotificationScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTokens();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Dark glass backdrop — pure JS, no native BlurView needed */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8,8,12,0.92)' }]} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications yet</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backButton: { padding: 8, marginLeft: -8 },
  title: { fontSize: 20, fontWeight: '700' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '500' }
});

export default NotificationScreen;
