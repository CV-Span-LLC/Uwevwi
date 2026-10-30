import { View } from 'react-native';

import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, PrimaryButton, Section, Txt } from '@/components/ui';
import { colors } from '@/theme';

export default function NotFound() {
  return (
    <SiteLayout>
      <Section background={colors.background} paddingY={140}>
        <View style={{ gap: 24 }}>
          <Eyebrow>PAGE NOT FOUND</Eyebrow>
          <Txt variant="h1">This page is not part of the collection.</Txt>
          <PrimaryButton label="Back to home" href="/" />
        </View>
      </Section>
    </SiteLayout>
  );
}
