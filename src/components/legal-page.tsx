import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, SecondaryButton, Section, Txt, useBreakpoint } from '@/components/ui';
import { CONTACT_EMAIL, LEGAL_DOCS, type LegalDoc } from '@/data/legal';
import { colors } from '@/theme';

/** Shared layout for the Privacy, Cookies and Terms pages. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const { isDesktop } = useBreakpoint();
  const others = LEGAL_DOCS.filter((d) => d.slug !== doc.slug);

  return (
    <SiteLayout>
      <Section background={colors.background} paddingTop={100} paddingBottom={80}>
        <View style={{ maxWidth: 800, gap: 24 }}>
          <Eyebrow>LEGAL</Eyebrow>
          <Txt variant="hero">{doc.title}</Txt>
          <Txt variant="small" color={colors.textSecondary}>
            Last updated {doc.updated}
          </Txt>
          <Txt color={colors.textSecondary}>{doc.intro}</Txt>
        </View>
      </Section>

      <Section paddingTop={80} paddingBottom={80}>
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 80 : 48 }}>
          <View style={{ flex: 1, maxWidth: 800, gap: 48 }}>
            {doc.sections.map((section, i) => (
              <View key={section.title} style={{ gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 16 }}>
                  <Txt variant="large" color={colors.accent}>
                    {String(i + 1).padStart(2, '0')}
                  </Txt>
                  <Txt variant="h3" style={{ flex: 1 }}>
                    {section.title}
                  </Txt>
                </View>
                {section.paragraphs.map((p) => (
                  <Txt key={p} color={colors.textSecondary}>
                    {p}
                  </Txt>
                ))}
                {section.bullets ? (
                  <View style={{ gap: 10 }}>
                    {section.bullets.map((b) => (
                      <View key={b} style={{ flexDirection: 'row', gap: 12 }}>
                        <Txt color={colors.accent}>•</Txt>
                        <Txt color={colors.textSecondary} style={{ flex: 1 }}>
                          {b}
                        </Txt>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>

          <View style={{ width: isDesktop ? 280 : '100%', gap: 24, borderLeftWidth: isDesktop ? 2 : 0, borderLeftColor: colors.borders, paddingLeft: isDesktop ? 32 : 0 }}>
            <Txt variant="large">ALSO READ</Txt>
            <View style={{ gap: 4 }}>
              {others.map((d) => (
                <Link key={d.slug} href={d.href} asChild>
                  <Pressable accessibilityRole="link" style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borders }}>
                    <Txt color={colors.accent}>{d.title}</Txt>
                  </Pressable>
                </Link>
              ))}
            </View>
            <Txt variant="small" color={colors.textSecondary}>
              Questions about this page? Write to {CONTACT_EMAIL}.
            </Txt>
            <SecondaryButton label="Get in touch" href="/contact" style={{ marginLeft: -40 }} />
          </View>
        </View>
      </Section>
    </SiteLayout>
  );
}
