import React from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';

export const AppFlashList = <ItemT,>(props: any) => {
  return (
    <FlashList
      {...props}
    />
  );
};
