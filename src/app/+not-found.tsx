import { View } from 'react-native';

import { ArrowLine, BlinkPlus, Frame, PixelWordmark, TechButton } from '@/components/futuristic';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Txt, useBreakpoint } from '@/components/ui';
import { colors } from '@/theme';

export default function NotFound() {
  const { isMobile } = useBreakpoint();
  return (
    <SiteLayout>
      <Frame background={colors.background} overflow="hidden">
        <View style={{ paddingTop: isMobile ? 64 : 120, gap: 28 }}>
          <Eyebrow>Page not found</Eyebrow>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <ArrowLine width={isMobile ? 44 : 72} />
            <BlinkPlus size={isMobile ? 24 : 32} />
          </View>
          <Txt variant="stack" style={{ maxWidth: 760 }}>
            This page is not part of the collection.
          </Txt>
          <TechButton label="Back to home" href="/" tone="accent" />
        </View>
        <View style={{ marginTop: isMobile ? 56 : 96 }}>
          <PixelWordmark text="404" color="#ddd6ca" />
        </View>
      </Frame>
    </SiteLayout>
  );
}
