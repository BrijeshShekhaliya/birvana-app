import { View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { Card } from '@/components/primitives/Card';
import { Screen } from '@/components/primitives/Screen';

type RoutePlaceholderScreenProps = {
  description: string;
  title: string;
};

export function RoutePlaceholderScreen({
  description,
  title,
}: RoutePlaceholderScreenProps) {
  return (
    <Screen contentClassName="justify-center">
      <View className="gap-6">
        <View className="gap-2">
          <AppText variant="display">{title}</AppText>
          <AppText tone="muted">
            Route registered. UI intentionally deferred until the next implementation phase.
          </AppText>
        </View>

        <Card className="gap-3">
          <AppText variant="heading">Foundation Ready</AppText>
          <AppText tone="muted">{description}</AppText>
        </Card>
      </View>
    </Screen>
  );
}
