import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguageStore } from '@/store/languageStore';
import { useUIStore } from '@/store/uiStore';
import { useTokens } from '@/theme/useTokens';
import { Ionicons } from '@expo/vector-icons';

const languages = [
  { code: 'hi', label: 'Hindi' },
  { code: 'en', label: 'English' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'bn', label: 'Bengali' },
  { code: 'kn', label: 'Kannada' },
  { code: 'bh', label: 'Bhojpuri' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'hi', label: 'Haryanvi' },
  { code: 'ra', label: 'Rajasthani' },
  { code: 'od', label: 'Odia' },
  { code: 'as', label: 'Assamese' },
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const { colors, spacing, radius } = useTokens();
  const { selectedLanguage, setLanguage } = useLanguageStore();
  const { setOnboardingComplete } = useUIStore();

  const selectLang = (code: string) => setLanguage(code);

  const canContinue = !!selectedLanguage;

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    setOnboardingComplete(true);
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as any }] });
  }, [canContinue, navigation, setOnboardingComplete]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.pageBackground, padding: spacing.horizontalPadding, justifyContent: 'center' }}>
      <Text style={{ color: colors.textPrimary, fontSize: 26, fontWeight: '700', textAlign: 'center' }}>Birvana</Text>
      <Text style={{ color: colors.textPrimary, fontSize: 26, fontWeight: '700', textAlign: 'center', marginTop: 8 }}>
        What's your vibe?
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 4 }}>
        Pick a language to get started
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 24 }}>
        {languages.map((lang) => {
          const selected = selectedLanguage === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => selectLang(lang.code)}
              style={{
                width: '48%',
                height: 52,
                backgroundColor: selected ? colors.accentDim : colors.cardBackground,
                borderWidth: 0.5,
                borderColor: selected ? colors.primaryAccent : colors.borderSubtle,
                borderRadius: radius.button,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>{lang.label}</Text>
              {selected && <Ionicons name="checkmark" size={20} color={colors.primaryAccent} style={{ position: 'absolute', right: 8 }} />}
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        onPress={handleContinue}
        disabled={!canContinue}
        style={{
          marginTop: 16,
          height: 52,
          borderRadius: radius.button,
          backgroundColor: canContinue ? colors.primaryAccent : colors.elevatedSurface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: canContinue ? colors.textOnAccent : colors.textSecondary, fontSize: 16, fontWeight: '700' }}>
          Let's go
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;
