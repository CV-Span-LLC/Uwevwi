import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { PrimaryButton, Section, Eyebrow, Txt, useBreakpoint } from '@/components/ui';
import { colors, fonts } from '@/theme';

const ICON_USER = require('../../assets/figma/icon-user.svg');
const ICON_LETTER = require('../../assets/figma/icon-letter.svg');
const ICON_LIKE = require('../../assets/figma/icon-like.svg');
const CHEVRON = require('../../assets/figma/chevron-up.svg');

type Comment = {
  id: string;
  name: string;
  when: string;
  text: string;
  likes: number;
  liked: boolean;
  author?: boolean;
  replies: Comment[];
};

const SEED: Comment[] = [
  {
    id: 'c1',
    name: 'Chidinma Chuck',
    when: '2 hours ago',
    text: 'I would love to see more archive like this. It would add depth to the discussion and help younger generations understand the culture better.',
    likes: 4,
    liked: false,
    replies: [
      {
        id: 'c1r1',
        name: 'Nazerin Gbinije',
        when: '2 hours ago',
        text: 'Thank you, Chidinma. We’re glad you found the archive meaningful.',
        likes: 4,
        liked: false,
        author: true,
        replies: [],
      },
    ],
  },
];

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  );
}

function Avatar({ name, size = 80 }: { name: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#1f1f1f', alignItems: 'center', justifyContent: 'center' }}>
      <Txt variant="quote" color={colors.white} style={{ fontSize: size * 0.4, lineHeight: size * 0.52 }}>
        {initials(name)}
      </Txt>
    </View>
  );
}

function Field({
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  height,
  error,
}: {
  icon?: number;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'email-address';
  multiline?: boolean;
  height: number;
  error?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: height,
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        gap: 8,
        backgroundColor: 'rgba(245,242,236,0.45)',
        borderWidth: 1,
        borderColor: error ? colors.accent : colors.borders,
        borderRadius: 8,
        paddingHorizontal: multiline ? 40 : 24,
        paddingVertical: multiline ? 24 : 0,
      }}
    >
      {icon ? <Image source={icon} style={{ width: 24, height: 24 }} contentFit="contain" /> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType ? 'none' : 'sentences'}
        multiline={multiline}
        style={{
          flex: 1,
          fontFamily: fonts.body,
          fontSize: 14,
          lineHeight: 22,
          color: colors.text,
          minHeight: multiline ? height - 48 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
          // Remove the browser focus outline; the border already carries the state.
          ...({ outlineStyle: 'none' } as object),
        }}
      />
    </View>
  );
}

function CommentView({ comment, onLike, onReply }: { comment: Comment; onLike: (id: string) => void; onReply: (name: string) => void }) {
  const { isMobile } = useBreakpoint();
  const [showReplies, setShowReplies] = useState(true);
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: isMobile ? 14 : 23, alignItems: 'flex-start' }}>
        <Avatar name={comment.name} size={isMobile ? 48 : 80} />
        <View style={{ flex: 1, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', columnGap: 16, rowGap: 4 }}>
            <Txt variant="h4" color="#000">
              {comment.name}
            </Txt>
            {comment.author ? (
              <View style={{ backgroundColor: colors.accent, height: 24, borderRadius: 8, paddingHorizontal: 8, justifyContent: 'center', alignSelf: 'center' }}>
                <Txt variant="small" color={colors.white}>
                  Author
                </Txt>
              </View>
            ) : null}
            <Txt variant="small" color={colors.textSecondary}>
              {comment.when}
            </Txt>
          </View>
          <Txt color={colors.textSecondary}>{comment.text}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={comment.liked ? 'Unlike comment' : 'Like comment'}
              onPress={() => onLike(comment.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, paddingRight: 14, borderRightWidth: 1, borderRightColor: colors.borders }}
            >
              <Txt variant="small" color={colors.accent}>
                {comment.likes}
              </Txt>
              <Image source={ICON_LIKE} style={{ width: 24, height: 24, opacity: comment.liked ? 1 : 0.6 }} contentFit="contain" />
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => onReply(comment.name)} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
              <Txt variant="small" color={colors.textSecondary}>
                Reply
              </Txt>
            </Pressable>
          </View>
        </View>
      </View>
      {comment.replies.length > 0 ? (
        <>
          <Pressable accessibilityRole="button" onPress={() => setShowReplies((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={CHEVRON} style={{ width: 24, height: 24, transform: [{ rotate: showReplies ? '0deg' : '180deg' }] }} contentFit="contain" />
            <Txt variant="small" color={colors.textSecondary}>
              {showReplies ? 'Hide reply' : `Show ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
            </Txt>
          </Pressable>
          {showReplies ? (
            <View style={{ borderLeftWidth: 2, borderLeftColor: colors.borders, paddingLeft: isMobile ? 14 : 26, gap: 26 }}>
              {comment.replies.map((r) => (
                <CommentView key={r.id} comment={r} onLike={onLike} onReply={onReply} />
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function toggleLike(list: Comment[], id: string): Comment[] {
  return list.map((c) =>
    c.id === id
      ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }
      : { ...c, replies: toggleLike(c.replies, id) },
  );
}

/** Comment thread with a posting form. Comments live in memory only: there is no backend yet. */
export function Comments() {
  const { isMobile } = useBreakpoint();
  const [comments, setComments] = useState<Comment[]>(SEED);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const nextId = useRef(1);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const valid = text.trim().length > 0 && name.trim().length > 0 && emailOk;

  const post = () => {
    setSubmitted(true);
    if (!valid) return;
    setComments((prev) => [
      { id: `new-${nextId.current++}`, name: name.trim(), when: 'Just now', text: text.trim(), likes: 0, liked: false, replies: [] },
      ...prev,
    ]);
    setText('');
    setName('');
    setEmail('');
    setSubmitted(false);
  };

  return (
    <Section paddingTop={50} paddingBottom={80} innerStyle={{ gap: 43 }}>
      <View style={{ gap: 24 }}>
        <Eyebrow>COMMENTS</Eyebrow>
        <Txt variant="h2">Join the conversation</Txt>
        <Txt color={colors.textSecondary}>Share your thoughts, questions or reflections about this article.</Txt>
      </View>
      <View style={{ gap: 24 }}>
        <Field value={text} onChangeText={setText} placeholder="Write a comment...." multiline height={150} error={submitted && !text.trim()} />
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 24 }}>
            <Field icon={ICON_USER} value={name} onChangeText={setName} placeholder="Your name" height={60} error={submitted && !name.trim()} />
            <Field icon={ICON_LETTER} value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" height={60} error={submitted && !emailOk} />
          </View>
          <Txt variant="caption" color={colors.textSecondary}>
            {submitted && !valid ? 'Please add a comment, your name and a valid email address.' : 'Your email will not be displayed publicly.'}
          </Txt>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <PrimaryButton label="Post comment" onPress={post} />
        </View>
      </View>
      <View style={{ height: 2, backgroundColor: colors.borders }} />
      <View style={{ gap: 36 }}>
        {comments.map((c) => (
          <CommentView
            key={c.id}
            comment={c}
            onLike={(id) => setComments((prev) => toggleLike(prev, id))}
            onReply={(who) => setText((t) => (t.startsWith(`@${who}`) ? t : `@${who} ${t}`))}
          />
        ))}
      </View>
    </Section>
  );
}
