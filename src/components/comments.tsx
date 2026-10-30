import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { PrimaryButton, Section, Eyebrow, Txt, useBreakpoint } from '@/components/ui';
import { ApiError, publicApi, timeAgo, type CommentNode } from '@/lib/api';
import { colors, fonts } from '@/theme';

const ICON_USER = require('../../assets/figma/icon-user.svg');
const ICON_LETTER = require('../../assets/figma/icon-letter.svg');
const ICON_LIKE = require('../../assets/figma/icon-like.svg');
const CHEVRON = require('../../assets/figma/chevron-up.svg');

type Comment = CommentNode & { liked?: boolean };

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

function CommentView({ comment, onLike, onReply }: { comment: Comment; onLike: (id: number) => void; onReply: (comment: Comment) => void }) {
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
            {comment.isAuthor ? (
              <View style={{ backgroundColor: colors.accent, height: 24, borderRadius: 8, paddingHorizontal: 8, justifyContent: 'center', alignSelf: 'center' }}>
                <Txt variant="small" color={colors.white}>
                  Author
                </Txt>
              </View>
            ) : null}
            <Txt variant="small" color={colors.textSecondary}>
              {timeAgo(comment.createdAt)}
            </Txt>
          </View>
          <Txt color={colors.textSecondary}>{comment.body}</Txt>
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
            <Pressable accessibilityRole="button" onPress={() => onReply(comment)} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
              <Txt variant="small" color={colors.textSecondary}>
                Reply
              </Txt>
            </Pressable>
          </View>
        </View>
      </View>
      {(comment.replies?.length ?? 0) > 0 ? (
        <>
          <Pressable accessibilityRole="button" onPress={() => setShowReplies((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={CHEVRON} style={{ width: 24, height: 24, transform: [{ rotate: showReplies ? '0deg' : '180deg' }] }} contentFit="contain" />
            <Txt variant="small" color={colors.textSecondary}>
              {showReplies ? 'Hide reply' : `Show ${comment.replies?.length === 1 ? 'reply' : 'replies'}`}
            </Txt>
          </Pressable>
          {showReplies ? (
            <View style={{ borderLeftWidth: 2, borderLeftColor: colors.borders, paddingLeft: isMobile ? 14 : 26, gap: 26 }}>
              {comment.replies?.map((r) => (
                <CommentView key={r.id} comment={r} onLike={onLike} onReply={onReply} />
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function toggleLike(list: Comment[], id: number, likes?: number): Comment[] {
  return list.map((c) =>
    c.id === id
      ? { ...c, liked: !c.liked, likes: likes ?? c.likes + (c.liked ? -1 : 1) }
      : { ...c, replies: c.replies ? toggleLike(c.replies, id, likes) : c.replies },
  );
}

/** Comment thread with a posting form, backed by the API. */
export function Comments({ slug, initial, closed }: { slug: string; initial: CommentNode[]; closed?: boolean }) {
  const { isMobile } = useBreakpoint();
  const [comments, setComments] = useState<Comment[]>(initial);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const valid = text.trim().length > 0 && name.trim().length > 0 && emailOk;

  const post = async () => {
    setSubmitted(true);
    setServerError(null);
    if (!valid || posting) return;
    setPosting(true);
    try {
      const created = await publicApi<CommentNode & { parentId: number | null }>(`/research/${slug}/comments`, {
        method: 'POST',
        body: { name: name.trim(), email: email.trim(), text: text.trim(), parentId: replyTo?.id },
      });
      setComments((prev) =>
        created.parentId === null
          ? [{ ...created }, ...prev]
          : prev.map((c) => (c.id === created.parentId ? { ...c, replies: [...(c.replies ?? []), created] } : c)),
      );
      setText('');
      setReplyTo(null);
      setSubmitted(false);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'We could not post your comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const like = async (id: number) => {
    const target = findComment(comments, id);
    const liked = !target?.liked;
    setComments((prev) => toggleLike(prev, id));
    try {
      const result = await publicApi<{ likes: number }>(`/comments/${id}/like`, { method: 'POST', body: { liked } });
      setComments((prev) => prev.map((c) => patchLikes(c, id, result.likes)));
    } catch {
      setComments((prev) => toggleLike(prev, id));
    }
  };

  return (
    <Section paddingTop={50} paddingBottom={80} innerStyle={{ gap: 43 }}>
      <View style={{ gap: 24 }}>
        <Eyebrow>COMMENTS</Eyebrow>
        <Txt variant="h2">Join the conversation</Txt>
        <Txt color={colors.textSecondary}>Share your thoughts, questions or reflections about this article.</Txt>
      </View>
      {closed ? (
        <Txt color={colors.textSecondary}>Comments are closed for this piece.</Txt>
      ) : (
        <View style={{ gap: 24 }}>
          {replyTo ? (
            <Pressable accessibilityRole="button" onPress={() => setReplyTo(null)} style={{ flexDirection: 'row', gap: 8, alignSelf: 'flex-start' }}>
              <Txt variant="small" color={colors.accent}>
                Replying to {replyTo.name}. Cancel
              </Txt>
            </Pressable>
          ) : null}
          <Field value={text} onChangeText={setText} placeholder="Write a comment...." multiline height={150} error={submitted && !text.trim()} />
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 24 }}>
              <Field icon={ICON_USER} value={name} onChangeText={setName} placeholder="Your name" height={60} error={submitted && !name.trim()} />
              <Field icon={ICON_LETTER} value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" height={60} error={submitted && !emailOk} />
            </View>
            <Txt variant="caption" color={serverError || (submitted && !valid) ? colors.accent : colors.textSecondary}>
              {serverError ?? (submitted && !valid ? 'Please add a comment, your name and a valid email address.' : 'Your email will not be displayed publicly. ')}
              {serverError || (submitted && !valid) ? null : (
                <>
                  See our{' '}
                  <Link href="/privacy-policy" style={{ color: colors.accent, textDecorationLine: 'underline' }}>
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/terms-of-use" style={{ color: colors.accent, textDecorationLine: 'underline' }}>
                    Terms of Use
                  </Link>
                  .
                </>
              )}
            </Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <PrimaryButton label={posting ? 'Posting…' : 'Post comment'} onPress={post} disabled={posting} />
          </View>
        </View>
      )}
      <View style={{ height: 2, backgroundColor: colors.borders }} />
      <View style={{ gap: 36 }}>
        {comments.length === 0 ? <Txt color={colors.textSecondary}>No comments yet. Be the first to share a thought.</Txt> : null}
        {comments.map((c) => (
          <CommentView key={c.id} comment={c} onLike={like} onReply={(target) => setReplyTo(target)} />
        ))}
      </View>
    </Section>
  );
}

function findComment(list: Comment[], id: number): Comment | undefined {
  for (const c of list) {
    if (c.id === id) return c;
    const inner = c.replies ? findComment(c.replies, id) : undefined;
    if (inner) return inner;
  }
  return undefined;
}

function patchLikes(c: Comment, id: number, likes: number): Comment {
  return c.id === id ? { ...c, likes } : { ...c, replies: c.replies?.map((r) => patchLikes(r, id, likes)) };
}
