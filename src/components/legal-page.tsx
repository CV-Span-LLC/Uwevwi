import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { PageHero } from '@/components/blocks';
import { TechButton } from '@/components/futuristic';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Section, Txt, useBreakpoint } from '@/components/ui';
import { CONTACT_EMAIL, LEGAL_DOCS, type LegalDoc } from '@/data/legal';
import { colors } from '@/theme';

/** Shared layout for the Privacy, Cookies and Terms pages. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const { isDesktop, isMobile } = useBreakpoint();
  const others = LEGAL_DOCS.filter((d) => d.slug !== doc.slug);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="LEGAL"
        title={doc.title}
        meta={`LAST UPDATED ${doc.updated.toUpperCase()}`}
        paragraphs={[doc.intro]}
        crumb={`Home / Legal / ${doc.title}`}
      />

      <Section paddingY={100}>
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 80 : 48 }}>
          <View style={{ flex: 1, maxWidth: 800, gap: 0 }}>
            {doc.sections.map((section, i) => (
              <View key={section.title} style={{ gap: 16, paddingVertical: 36, borderTopWidth: 1, borderTopColor: colors.borders }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 16 }}>
                  <Txt variant="mono" color={colors.accent}>
                    {String(i + 1).padStart(2, '0')}
                  </Txt>
                  <Txt variant="h3" style={{ flex: 1 }}>
                    {section.title}
                  </Txt>
                </View>
                <View style={{ gap: 14, paddingLeft: isMobile ? 0 : 36 }}>
                  {section.paragraphs.map((p) => (
                    <Txt key={p} color={colors.textSecondary}>
                      {p}
                    </Txt>
                  ))}
                  {section.bullets ? (
                    <View style={{ gap: 10 }}>
                      {section.bullets.map((b) => (
                        <View key={b} style={{ flexDirection: 'row', gap: 12 }}>
                          <Txt variant="mono" color={colors.accent}>
                            /
                          </Txt>
                          <Txt color={colors.textSecondary} style={{ flex: 1 }}>
                            {b}
                          </Txt>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          <View style={{ width: isDesktop ? 300 : '100%' }}>
            <View
              style={[
                { gap: 22, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borders, padding: 24 },
                // Stays in view under the sticky navbar while the long text scrolls (web only; native just scrolls).
                isDesktop ? ({ position: 'sticky', top: 92 } as object) : null,
              ]}
            >
            <Eyebrow>Also read</Eyebrow>
            <View>
              {others.map((d) => (
                <Link key={d.slug} href={d.href} asChild>
                  <Pressable accessibilityRole="link" style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borders }}>
                    {({ hovered }: { hovered?: boolean }) => (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Txt variant="h5" color={hovered ? colors.accent : colors.text}>
                          {d.title}
                        </Txt>
                        <Txt variant="mono" color={colors.accent}>
                          →
                        </Txt>
                      </View>
                    )}
                  </Pressable>
                </Link>
              ))}
            </View>
            <Txt variant="monoBody" color={colors.textSecondary}>
              {`Questions about this page? Write to ${CONTACT_EMAIL}.`}
            </Txt>
            <TechButton label="Get in touch" href="/contact" tone="ink" />
            </View>
          </View>
        </View>
      </Section>
    </SiteLayout>
  );
}
