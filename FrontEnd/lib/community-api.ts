import { api } from '@/lib/api';
import type { CommunityComment, CommunityPost, Vote } from '@/components/community/types';

type ApiAuthor = { id: string; name: string; handle: string; initials: string; role: 'Student' | 'Mentor' | 'Admin'; avatar_url: string | null };
export type ApiComment = { id: string; parent_id: string | null; author: ApiAuthor; body: string; created_at: string; upvote_count: number; downvote_count: number; viewer_vote: Vote; replies?: ApiComment[] };
type ApiPost = { id: string; author: ApiAuthor; title: string; body: string; topic: string; created_at: string; image_url: string | null; like_count: number; comment_count: number; viewer_liked: boolean; comments?: ApiComment[] };

export type FeedResponse = { items: ApiPost[]; total: number; limit: number; offset: number; has_more: boolean };

export function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24); return days === 1 ? 'Yesterday' : `${days} days ago`;
}

function author(value: ApiAuthor) { return { id: value.id, name: value.name, handle: value.handle, initials: value.initials, role: value.role === 'Admin' ? 'Mentor' : value.role, avatar_url: value.avatar_url }; }
export function apiCommentToComment(value: ApiComment): CommunityComment { return { id: value.id, author: author(value.author), body: value.body, createdAt: relativeTime(value.created_at), upvotes: value.upvote_count, downvotes: value.downvote_count, vote: value.viewer_vote, replies: value.replies?.map(apiCommentToComment) }; }
export function apiPostToPost(value: ApiPost): CommunityPost { return { id: value.id, author: author(value.author), title: value.title, body: value.body, topic: value.topic, createdAt: relativeTime(value.created_at), likes: value.like_count, liked: value.viewer_liked, imageUrl: value.image_url ?? undefined, comments: value.comments?.map(apiCommentToComment) ?? [], commentCount: value.comment_count }; }

export const getCommunityPosts = (query: string) => api.get(`/api/v1/community/posts?${query}`) as Promise<FeedResponse>;
export const getCommunityPost = (id: string) => api.get(`/api/v1/community/posts/${encodeURIComponent(id)}`) as Promise<ApiPost>;
export const toggleCommunityLike = (id: string) => api.post(`/api/v1/community/posts/${encodeURIComponent(id)}/like`) as Promise<{ liked: boolean; like_count: number }>;
export const addCommunityComment = (postId: string, body: string, parentId?: string) => api.post(`/api/v1/community/posts/${encodeURIComponent(postId)}/comments`, { body, ...(parentId ? { parent_id: parentId } : {}) }) as Promise<ApiComment>;
export const voteCommunityComment = (id: string, vote: Vote) => api.post(`/api/v1/community/comments/${encodeURIComponent(id)}/vote`, { vote }) as Promise<{ vote: Vote; upvote_count: number; downvote_count: number }>;
export const reportCommunityContent = (targetType: 'post' | 'comment', targetId: string, reason: string) => api.post('/api/v1/community/reports', { target_type: targetType, target_id: targetId, reason });
export const presignCommunityImage = (file: File) => api.post('/api/v1/community/uploads/presign', { filename: file.name, content_type: file.type, size_bytes: file.size }) as Promise<{ upload_url: string; file_url: string }>;
export async function uploadCommunityImage(file: File) { const upload = await presignCommunityImage(file); const response = await fetch(upload.upload_url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file }); if (!response.ok) throw new Error('Image upload failed.'); return upload.file_url; }
