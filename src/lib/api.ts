import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORT = 8787;

/** Where the API lives. In development it is on port 8787; a production web build uses its own origin. */
export function apiBase(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // A deployed site is served from one origin with the API behind /api, so there is nothing to configure.
    return __DEV__ ? `${window.location.protocol}//${window.location.hostname}:${PORT}` : window.location.origin;
  }
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:${PORT}`;
}

/** Turns a stored `/uploads/...` path into a full URL. */
export function assetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return /^https?:\/\//.test(path) ? path : `${apiBase()}${path}`;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const TOKEN_KEY = 'uwevwi.admin.token';
let memoryToken: string | null = null;

export async function loadToken(): Promise<string | null> {
  try {
    memoryToken = (await AsyncStorage.getItem(TOKEN_KEY)) ?? null;
  } catch {
    memoryToken = null;
  }
  return memoryToken;
}

export async function saveToken(token: string | null) {
  memoryToken = token;
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private windows; the session then lasts until reload.
  }
}

type Options = { method?: string; body?: unknown; auth?: boolean };

export async function request<T>(path: string, { method = 'GET', body, auth = false }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && memoryToken) headers.Authorization = `Bearer ${memoryToken}`;
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'We could not reach the server. Check your connection and try again.');
  }
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new ApiError(response.status, data.error ?? 'Something went wrong. Please try again.');
  return data as T;
}

export const publicApi = <T>(path: string, options?: Options) => request<T>(`/api/public${path}`, options);
export const adminApi = <T>(path: string, options?: Options) => request<T>(`/api/admin${path}`, { ...options, auth: true });

/** Uploads a picked image and returns its stored path. */
export async function uploadImage(file: { uri: string; name?: string; type?: string; webFile?: File | null }): Promise<string> {
  const form = new FormData();
  const type = file.type ?? 'image/jpeg';
  if (Platform.OS === 'web') {
    const blob = file.webFile ?? (await (await fetch(file.uri)).blob());
    form.append('file', blob, file.name ?? 'image');
  } else {
    form.append('file', { uri: file.uri, name: file.name ?? 'image.jpg', type } as unknown as Blob);
  }
  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api/admin/upload`, { method: 'POST', headers: memoryToken ? { Authorization: `Bearer ${memoryToken}` } : {}, body: form });
  } catch {
    throw new ApiError(0, 'We could not reach the server. Check your connection and try again.');
  }
  const data = (await response.json().catch(() => ({}))) as { path?: string; error?: string };
  if (!response.ok || !data.path) throw new ApiError(response.status, data.error ?? 'The upload failed. Please try again.');
  return data.path;
}

// ---------- shared types ----------

export type ResearchSummary = {
  id: number;
  slug: string;
  title: string;
  type: 'Research Paper' | 'Journal' | 'Writers Commission';
  excerpt: string;
  image: string | null;
  part: string | null;
  status: 'draft' | 'scheduled' | 'published';
  publishedAt: string;
  updatedAt: string;
  views: number;
  comments: number;
  commentsHidden: boolean;
  author: string;
};

export type CommentNode = {
  id: number;
  name: string;
  body: string;
  isAuthor: boolean;
  likes: number;
  createdAt: string;
  replies?: CommentNode[];
};

export type ResearchDetail = ResearchSummary & { content: string; comments: CommentNode[] };

export type Artist = { name: string; bio: string; photo: string | null; works: string[] };

export type Exhibition = {
  id: number;
  slug: string;
  title: string;
  series: string;
  edition: string;
  dateLabel: string;
  location: string;
  intro: string;
  flyer: string | null;
  galleryHeading: string;
  galleryText: string;
  gallery: string[];
  artists: Artist[];
  noteHeading: string;
  noteText: string;
  status: 'draft' | 'published' | 'hidden';
  updatedAt: string;
};

export const RESEARCH_TYPES: ResearchSummary['type'][] = ['Research Paper', 'Journal', 'Writers Commission'];

/** "2 hours ago" style label. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return formatDate(iso);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}
