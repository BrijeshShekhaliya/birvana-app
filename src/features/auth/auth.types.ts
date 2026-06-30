export const OTP_LENGTH = 6;

export const heardAboutOptions = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Ads', value: 'ads' },
  { label: 'Friend', value: 'friend' },
  { label: 'Search', value: 'search' },
] as const;

export type HeardAboutValue = (typeof heardAboutOptions)[number]['value'];

export type OtpFlow = 'login' | 'signup';

export type SignUpDraft = {
  displayName: string;
  email: string;
  heardAbout: HeardAboutValue;
  password: string;
};
