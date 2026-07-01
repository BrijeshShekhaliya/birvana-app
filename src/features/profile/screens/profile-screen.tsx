import { useMemo, useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, ImageBackground, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CachedImage } from '@/components/primitives/CachedImage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import TrackPlayer from 'react-native-track-player';

import { AppText } from '@/components/primitives/AppText';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { profileQueryOptions } from '@/features/auth/queries/profile.query';
import { useLogoutMutation, useDeleteAccountMutation } from '@/features/auth/queries/auth.mutations';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-errors';

import type { AppStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/store/uiStore';
import { useAppTheme } from '@/theme/useAppTheme';

type ProfileScreenProps = NativeStackScreenProps<AppStackParamList, 'Profile'>;

function DetailRow({
  isLast = false,
  label,
  value,
}: {
  isLast?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        borderBottomColor: isLast ? 'transparent' : 'rgba(255,255,255,0.08)',
        borderBottomWidth: isLast ? 0 : 1,
        gap: 6,
        paddingBottom: isLast ? 0 : 16,
        paddingTop: 2,
      }}
    >
      <AppText
        style={{
          color: 'rgba(255,255,255,0.42)',
          fontSize: 12,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
        variant="caption"
      >
        {label}
      </AppText>
      <AppText
        selectable
        style={{
          fontSize: 17,
          lineHeight: 22,
        }}
        variant="label"
      >
        {value}
      </AppText>
    </View>
  );
}

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const isStacEnabled = useUIStore((state) => state.isStacEnabled);
  const setStacEnabled = useUIStore((state) => state.setStacEnabled);
  const logout = useLogoutMutation();
  const deleteAccount = useDeleteAccountMutation();
  const profileQuery = useQuery(profileQueryOptions(user?.id ?? ''));
  const queryClient = useQueryClient();
  const [isRestarting, setIsRestarting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggle = (value: boolean) => {
    setIsRestarting(true);
    setTimeout(async () => {
      setStacEnabled(value);
      try {
        await TrackPlayer.reset();
      } catch (e) {
        // Ignore if not initialized
      }
      queryClient.invalidateQueries();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      );
    }, 1800);
  };

  const displayName = useMemo(() => {
    return (
      profileQuery.data?.display_name?.trim() ||
      profileQuery.data?.username?.trim() ||
      (user?.user_metadata?.display_name as string | undefined)?.trim() ||
      user?.email?.split('@')[0] ||
      'Birvana User'
    );
  }, [profileQuery.data?.display_name, profileQuery.data?.username, user?.email, user?.user_metadata]);

  const email = profileQuery.data?.email?.trim() || user?.email || 'Unavailable';
  const username = profileQuery.data?.username?.trim() || 'Not set';
  const avatarUrl =
    profileQuery.data?.avatar_url ||
    ((user?.user_metadata?.avatar_url as string | undefined) ??
      (user?.user_metadata?.picture as string | undefined) ??
      null);
  const avatarInitial = displayName.trim().slice(0, 1).toUpperCase() || 'B';

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {isRestarting && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#0A0A0A',
            zIndex: 9999,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ExpoImage 
            source={require('../../../../assets/birvana-mark.png')} 
            style={{ width: 120, height: 120, marginBottom: 24 }} 
            contentFit="contain" 
          />
          <AppText style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
            Switching Providers
          </AppText>
          <AppText style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
            Restarting app...
          </AppText>
        </Animated.View>
      )}

      {/* Proper Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingTop: Math.max(insets.top, 16), 
        paddingHorizontal: 16, 
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginLeft: -8 }}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <AppText variant="label" style={{ fontSize: 18, fontWeight: '700', color: '#FFF' }}>Profile</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 100,
          paddingHorizontal: 20,
          paddingTop: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          {avatarUrl ? (
            <CachedImage
              source={{ uri: avatarUrl }}
              style={{ borderRadius: 60, height: 120, width: 120, marginBottom: 16 }}
            />
          ) : (
            <View style={{
              alignItems: 'center',
              backgroundColor: '#1E1E1E',
              borderRadius: 60,
              height: 120,
              width: 120,
              justifyContent: 'center',
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)'
            }}>
              <AppText style={{ fontSize: 48, color: '#FFF', fontWeight: 'bold' }}>{avatarInitial}</AppText>
            </View>
          )}

          <AppText style={{ fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 4 }}>
            {displayName}
          </AppText>
          <AppText style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
            {email}
          </AppText>

          {/* Edit Profile Button Placeholder */}
          <TouchableOpacity 
            style={{
              paddingVertical: 10,
              paddingHorizontal: 24,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
            }}
            onPress={() => alert('Edit Profile coming soon!')}
          >
            <AppText style={{ fontSize: 14, fontWeight: '600', color: '#FFF' }}>Edit Profile</AppText>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 16 }}>
          <View style={{
            backgroundColor: '#141414',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}>
            <DetailRow label="Profile Name" value={displayName} />
            <DetailRow label="Email Account" value={email} />
            <DetailRow isLast label="Username" value={username} />
          </View>

          {/* Settings Section */}
          <View style={{
            backgroundColor: '#141414',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <AppText variant="label" style={{ fontSize: 17, marginBottom: 4 }}>
                Stac Audio Engine
              </AppText>
              <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 18 }}>
                {isStacEnabled 
                  ? "Advanced streaming engine active" 
                  : "Standard engine (Recommended)"}
              </AppText>
            </View>
            <Switch
              value={isStacEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: '#333', true: '#4A90E2' }}
              thumbColor={isStacEnabled ? '#FFF' : '#A0A0A0'}
            />
          </View>

          {profileQuery.isError ? (
            <AppText style={{ color: '#FF4444', textAlign: 'center', marginTop: 8 }}>
              {getAuthErrorMessage(profileQuery.error, 'Profile could not be loaded.')}
            </AppText>
          ) : null}

          <TouchableOpacity
            disabled={logout.isPending || deleteAccount.isPending}
            onPress={() => logout.mutate()}
            style={{
              marginTop: 24,
              alignSelf: 'center',
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 30,
            }}
          >
            <AppText style={{ color: '#FF4444', fontSize: 16, fontWeight: '600' }}>
              {logout.isPending ? 'Signing out...' : 'Sign out'}
            </AppText>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            disabled={logout.isPending || deleteAccount.isPending}
            onPress={() => setShowDeleteModal(true)}
            style={{
              marginTop: 16,
              alignSelf: 'center',
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 30,
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
            }}
          >
            <AppText style={{ color: '#FF4444', fontSize: 14, fontWeight: '600' }}>
              Delete Account
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10000,
          justifyContent: 'center', alignItems: 'center', padding: 24
        }}>
          <View style={{
            backgroundColor: '#1A1A1A', padding: 24, borderRadius: 20, width: '100%',
            borderWidth: 1, borderColor: 'rgba(255,68,68,0.3)'
          }}>
            <AppText style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 12 }}>
              Delete Account
            </AppText>
            <AppText style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 20 }}>
              This action is permanent and will destroy all your saved data. This cannot be undone. Are you sure?
            </AppText>
            
            {deleteAccount.isError && (
              <AppText style={{ color: '#FF4444', marginBottom: 16, fontSize: 13 }}>
                {getAuthErrorMessage(deleteAccount.error, 'Failed to delete account.')}
              </AppText>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#333', alignItems: 'center' }}
              >
                <AppText style={{ color: '#FFF', fontWeight: '600' }}>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={deleteAccount.isPending}
                onPress={() => deleteAccount.mutate(undefined, {
                  onSuccess: () => setShowDeleteModal(false)
                })}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#FF4444', alignItems: 'center', opacity: deleteAccount.isPending ? 0.5 : 1 }}
              >
                <AppText style={{ color: '#FFF', fontWeight: '600' }}>
                  {deleteAccount.isPending ? 'Deleting...' : 'Confirm'}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
