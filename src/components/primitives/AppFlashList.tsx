import { FlashList, type FlashListProps } from '@shopify/flash-list';

type AppFlashListProps<TItem> = FlashListProps<TItem>;

export function AppFlashList<TItem>(props: AppFlashListProps<TItem>) {
  return <FlashList showsVerticalScrollIndicator={false} {...props} />;
}
