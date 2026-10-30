export type LegalSection = {
  title: string;
  paragraphs: string[];
  /** Optional bullet list shown after the paragraphs. */
  bullets?: string[];
};

export type LegalDoc = {
  slug: 'privacy-policy' | 'terms-of-use' | 'cookies-policy';
  href: '/privacy-policy' | '/terms-of-use' | '/cookies-policy';
  label: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

export const CONTACT_EMAIL = 'hello@uwevwistudio.org';
const UPDATED = '30 October 2026';

export const PRIVACY: LegalDoc = {
  slug: 'privacy-policy',
  href: '/privacy-policy',
  label: 'Privacy Policy',
  title: 'Privacy Policy',
  updated: UPDATED,
  intro:
    'This policy explains what personal information Uwevwi collects through this website, why we collect it, and the choices you have. We keep what we collect to the minimum needed to respond to you and to run the site.',
  sections: [
    {
      title: 'Who we are',
      paragraphs: [
        'Uwevwi is a cultural asset advisory practice based in Lagos, Nigeria. Uwevwi Studios is its creative and cultural arm. In this policy, “Uwevwi”, “we” and “us” refer to both.',
        `If you have a question about this policy or how we handle your information, write to us at ${CONTACT_EMAIL}.`,
      ],
    },
    {
      title: 'Information we collect',
      paragraphs: ['We collect only the information you choose to give us:'],
      bullets: [
        'Enquiries. When you use the contact form we receive your name, email address, organisation (optional), the type of enquiry and your message.',
        'Comments. If you comment on a journal or research piece, we receive your name, email address and the comment itself. Your email address is never shown publicly.',
        'Correspondence. If you email us, we keep the message and our replies.',
      ],
    },
    {
      title: 'Information we do not collect',
      paragraphs: [
        'We do not ask for payment details, government identifiers or sensitive personal information through this site. We do not run advertising trackers and we do not sell personal information. See our Cookies Policy for how the site uses cookies and similar technologies.',
      ],
    },
    {
      title: 'How we use your information',
      paragraphs: ['We use the information you give us to:'],
      bullets: [
        'respond to your enquiry and, where you ask, discuss working together;',
        'publish and moderate comments, and let you know when your comment is answered;',
        'keep the site secure and prevent abuse; and',
        'meet legal and regulatory obligations.',
      ],
    },
    {
      title: 'Our lawful basis',
      paragraphs: [
        'We handle personal information in line with the Nigeria Data Protection Act 2023 and, where it applies to you, other data protection law. We rely on your consent when you submit a form or comment, on our legitimate interest in running and securing the site, and on legal obligation where the law requires us to keep or disclose information.',
      ],
    },
    {
      title: 'Who we share it with',
      paragraphs: [
        'We do not sell or rent your information. We share it only with service providers that help us run the site and our email (for example hosting and email providers), who may use it only on our instructions, and with authorities where the law requires it. Many engagements with our advisory clients are confidential, and we treat any information you share about a collection or an engagement in the same way.',
      ],
    },
    {
      title: 'How long we keep it',
      paragraphs: [
        'We keep enquiries for as long as needed to respond and for a reasonable period afterwards in case of follow-up questions, and comments for as long as the piece they relate to is published. You can ask us to delete your information sooner, as described below.',
      ],
    },
    {
      title: 'Your rights',
      paragraphs: [
        `You can ask us to tell you what information we hold about you, correct it, delete it, restrict or object to how we use it, or give you a copy. You can withdraw your consent at any time. To do any of this, email ${CONTACT_EMAIL}. If you are unhappy with our response, you may complain to the Nigeria Data Protection Commission.`,
      ],
    },
    {
      title: 'Security',
      paragraphs: [
        'We use reasonable technical and organisational measures to protect personal information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
      ],
    },
    {
      title: 'Children',
      paragraphs: [
        'This site is not directed at children and we do not knowingly collect personal information from them. If you believe a child has sent us information, please contact us and we will delete it.',
      ],
    },
    {
      title: 'Changes to this policy',
      paragraphs: [
        'We may update this policy from time to time. The date at the top of the page shows when it was last changed. If we make a significant change, we will say so on the site.',
      ],
    },
  ],
};

export const COOKIES: LegalDoc = {
  slug: 'cookies-policy',
  href: '/cookies-policy',
  label: 'Cookies',
  title: 'Cookies Policy',
  updated: UPDATED,
  intro:
    'This policy explains what cookies and similar technologies are, and how this website uses them. In short: at the time of writing, we use none that are not strictly needed.',
  sections: [
    {
      title: 'What are cookies?',
      paragraphs: [
        'Cookies are small text files that a website saves on your device. Similar technologies, such as local storage, do the same job. They are used to make sites work, to remember your choices and, on many sites, to measure traffic or show advertising.',
      ],
    },
    {
      title: 'What this site uses',
      paragraphs: [
        'This site does not use advertising or cross-site tracking cookies, and it does not currently use analytics cookies. Fonts and images are served from the site itself rather than from third-party networks, and the social media icons in the footer are plain links, not embedded widgets that set their own cookies.',
        'Your browser or hosting provider may still set strictly necessary technical cookies, for example to keep the site secure or to balance traffic across servers. These do not identify you and are needed for the site to work, so they do not require consent.',
      ],
    },
    {
      title: 'If this changes',
      paragraphs: [
        'If we add analytics or any other optional cookies in future, we will update this policy first, tell you which cookies are used and why, and ask for your consent before setting them. You will be able to change your mind at any time.',
      ],
    },
    {
      title: 'Third-party links',
      paragraphs: [
        'Links to other websites, including our social media profiles, take you away from this site. Those sites have their own cookie practices, which we do not control. Please read their policies.',
      ],
    },
    {
      title: 'Managing cookies',
      paragraphs: [
        'You can block or delete cookies in your browser settings. Doing so may affect how some sites work. The help pages of your browser explain how to do this.',
      ],
    },
    {
      title: 'Contact',
      paragraphs: [`If you have a question about cookies, email ${CONTACT_EMAIL}.`],
    },
  ],
};

export const TERMS: LegalDoc = {
  slug: 'terms-of-use',
  href: '/terms-of-use',
  label: 'Terms of Use',
  title: 'Terms of Use',
  updated: UPDATED,
  intro:
    'These terms govern your use of the Uwevwi website. By using the site you agree to them. If you do not agree, please do not use it.',
  sections: [
    {
      title: 'About the site',
      paragraphs: [
        'This site is operated by Uwevwi, a cultural asset advisory practice based in Lagos, Nigeria, together with Uwevwi Studios. It provides information about our advisory, stewardship and studio work, and publishes research and journal writing.',
      ],
    },
    {
      title: 'Information, not advice',
      paragraphs: [
        'Everything on this site is general information. It is not legal, tax, financial, investment, insurance or valuation advice, and it does not create an advisory relationship. Any engagement with Uwevwi begins only when we agree it with you in writing. Please take professional advice before acting on anything you read here.',
      ],
    },
    {
      title: 'Using the site',
      paragraphs: ['You agree to use the site lawfully and not to:'],
      bullets: [
        'interfere with the site, its security or other people’s use of it;',
        'attempt to gain unauthorised access to the site or its systems;',
        'copy or scrape the site in bulk, or use it to send unsolicited messages; or',
        'post anything unlawful, defamatory, harassing, discriminatory or that you do not have the right to share.',
      ],
    },
    {
      title: 'Intellectual property',
      paragraphs: [
        'Unless stated otherwise, the text, design and logos on this site belong to Uwevwi. Artworks, photographs and exhibition materials belong to the artists, photographers and organisations credited, and appear here with permission. You may not use them without the owner’s consent.',
        'Papers published in the Uwevwi Studios Archive are open access. They may be reproduced for educational and advocacy purposes with full attribution to Uwevwi Studios, Lagos, Nigeria. Any other use needs our written permission.',
      ],
    },
    {
      title: 'Comments',
      paragraphs: [
        'You are responsible for what you post. By posting a comment you give us a non-exclusive, royalty-free licence to display it on the site. We may remove or edit comments that break these terms or that we reasonably consider inappropriate, and we may block users who repeatedly do so. We do not endorse the views in comments.',
      ],
    },
    {
      title: 'Third-party links',
      paragraphs: [
        'The site may link to websites we do not operate. We are not responsible for their content or practices, and a link is not an endorsement.',
      ],
    },
    {
      title: 'Accuracy and availability',
      paragraphs: [
        'We take care to keep the site accurate and up to date, but we do not promise that it is complete, current or always available. Dates, programmes and exhibition details may change.',
      ],
    },
    {
      title: 'Limits on our liability',
      paragraphs: [
        'The site and its content are provided “as is”. To the extent the law allows, Uwevwi is not liable for any loss arising from your use of, or reliance on, the site or its content. Nothing in these terms limits liability that cannot be limited by law.',
      ],
    },
    {
      title: 'Privacy and cookies',
      paragraphs: [
        'Our Privacy Policy and Cookies Policy explain how we handle personal information and how the site uses cookies. They form part of these terms.',
      ],
    },
    {
      title: 'Governing law',
      paragraphs: [
        'These terms are governed by the laws of the Federal Republic of Nigeria, and the courts of Lagos State have jurisdiction over any dispute arising from them.',
      ],
    },
    {
      title: 'Changes and contact',
      paragraphs: [
        `We may update these terms from time to time. The date at the top of the page shows when they were last changed, and continuing to use the site means you accept the updated terms. Questions can be sent to ${CONTACT_EMAIL}.`,
      ],
    },
  ],
};

export const LEGAL_DOCS: LegalDoc[] = [PRIVACY, TERMS, COOKIES];
