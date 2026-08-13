"use client";

import {
  Filter,
  LoaderCircle,
  MessageSquarePlus,
  Search,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError, api } from "@/lib/api";
import {
  addCommunityComment,
  apiCommentToComment,
  apiPostToPost,
  getCommunityPost,
  getCommunityPosts,
  toggleCommunityLike,
  voteCommunityComment,
} from "@/lib/community-api";
import PostCard from "./PostCard";
import PostComposer from "./PostComposer";
import ReportDialog from "./ReportDialog";
import ThreadView from "./ThreadView";
import type { CommunityComment, CommunityPost } from "./types";

const topics = [
  "All topics",
  "For you",
  "Computer Science",
  "Mathematics",
  "Physics",
  "Study Skills",
];
function detail(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const value = error.body?.detail;
    if (typeof value === "string") return value;
    if (value?.message) return value.message;
  }
  return fallback;
}
function updateNested(
  comments: CommunityComment[],
  id: string,
  update: (item: CommunityComment) => CommunityComment,
): CommunityComment[] {
  return comments.map((item) =>
    item.id === id
      ? update(item)
      : {
          ...item,
          replies: item.replies
            ? updateNested(item.replies, id, update)
            : item.replies,
        },
  );
}
function appendNested(
  comments: CommunityComment[],
  parentId: string,
  child: CommunityComment,
): CommunityComment[] {
  return comments.map((item) =>
    item.id === parentId
      ? { ...item, replies: [...(item.replies ?? []), child] }
      : item,
  );
}
function findNested(
  comments: CommunityComment[],
  id: string,
): CommunityComment | undefined {
  for (const item of comments) {
    if (item.id === id) return item;
    const found = item.replies && findNested(item.replies, id);
    if (found) return found;
  }
  return undefined;
}

export default function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [topic, setTopic] = useState("All topics");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: "post" | "comment";
    id: string;
  } | null>(null);
  const loadPosts = useCallback(
    async (nextOffset = 0) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "20",
          offset: String(nextOffset),
        });
        if (topic !== "All topics" && topic !== "For you")
          params.set("topic", topic);
        if (query.trim()) params.set("search", query.trim());
        const response = await getCommunityPosts(params.toString());
        const mapped = response.items.map(apiPostToPost);
        setPosts(nextOffset ? (current) => [...current, ...mapped] : mapped);
        setOffset(nextOffset + mapped.length);
        setHasMore(response.has_more);
      } catch (error) {
        toast.error(detail(error, "Could not load the community."));
      } finally {
        setLoading(false);
      }
    },
    [topic, query],
  );
  useEffect(() => {
    const timer = window.setTimeout(() => void loadPosts(0), query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [loadPosts, query]);
  const openThread = async (id: string) => {
    setLoadingThread(true);
    try {
      setSelectedPost(apiPostToPost(await getCommunityPost(id)));
    } catch (error) {
      toast.error(detail(error, "This post is no longer available."));
    } finally {
      setLoadingThread(false);
    }
  };
  const like = async (id: string) => {
    try {
      const response = await toggleCommunityLike(id);
      const apply = (post: CommunityPost) =>
        post.id === id
          ? { ...post, liked: response.liked, likes: response.like_count }
          : post;
      setPosts((current) => current.map(apply));
      setSelectedPost((current) => (current ? apply(current) : current));
    } catch (error) {
      toast.error(detail(error, "Could not update the like."));
    }
  };
  const vote = async (id: string, value: "up" | "down") => {
    if (!selectedPost) return;
    const previous = selectedPost;
    const currentVote = findNested(selectedPost.comments, id)?.vote;
    setSelectedPost({
      ...selectedPost,
      comments: updateNested(selectedPost.comments, id, (item) => ({
        ...item,
        vote: currentVote === value ? null : value,
      })),
    });
    try {
      const response = await voteCommunityComment(
        id,
        currentVote === value ? null : value,
      );
      setSelectedPost((post) =>
        post
          ? {
              ...post,
              comments: updateNested(post.comments, id, (item) => ({
                ...item,
                vote: response.vote,
                upvotes: response.upvote_count,
                downvotes: response.downvote_count,
              })),
            }
          : post,
      );
    } catch (error) {
      setSelectedPost(previous);
      toast.error(detail(error, "Could not update the vote."));
    }
  };
  const addComment = async (body: string, parentId?: string) => {
    if (!selectedPost) return;
    try {
      const created = apiCommentToComment(
        await addCommunityComment(selectedPost.id, body, parentId),
      );
      setSelectedPost((post) =>
        post
          ? {
              ...post,
              commentCount: (post.commentCount ?? post.comments.length) + 1,
              comments: parentId
                ? appendNested(post.comments, parentId, created)
                : [...post.comments, created],
            }
          : post,
      );
    } catch (error) {
      toast.error(detail(error, "Could not post your response."));
    }
  };
  const publish = async (payload: {
    title: string;
    body: string;
    topic: string;
    image_url: string | null;
  }) => {
    try {
      const created = await api.post("/api/v1/community/posts", payload);
      setPosts((current) => [apiPostToPost(created), ...current]);
      setShowComposer(false);
    } catch (error) {
      throw new Error(detail(error, "Could not publish your post."));
    }
  };
  if (selectedPost)
    return (
      <>
        <ThreadView
          post={selectedPost}
          onBack={() => setSelectedPost(null)}
          onToggleLike={() => void like(selectedPost.id)}
          onCommentVote={(id, value) => void vote(id, value)}
          onAddComment={(body, parentId) => void addComment(body, parentId)}
          onReport={(type, id) => setReportTarget({ type, id })}
        />
        {reportTarget && (
          <ReportDialog
            targetType={reportTarget.type}
            targetId={reportTarget.id}
            onClose={() => setReportTarget(null)}
          />
        )}
      </>
    );
  return (
    <>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-brand-primary-dark to-brand-primary p-6 text-white md:flex-row md:items-center md:p-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-brand-primary-tint">
              <Sparkles size={17} />
              <span className="text-xs font-bold uppercase tracking-[0.16em]">
                Student community
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Learn together. Build confidence.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-brand-primary-tint">
              Share your work, ask thoughtful questions, and help other learners
              move forward.
            </p>
          </div>
          <button
            onClick={() => setShowComposer(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-brand-primary-dark"
          >
            <MessageSquarePlus size={18} />
            Create post
          </button>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
          <main>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search conversations"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <select
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600"
                >
                  {topics.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mb-4 text-sm font-semibold text-slate-500">
              Showing posts from the community.
            </p>
            {loading && !posts.length ? (
              <LoaderCircle className="mx-auto mt-12 animate-spin text-brand-primary" />
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onOpen={() => void openThread(post.id)}
                    onToggleLike={() => void like(post.id)}
                    onReport={() =>
                      setReportTarget({ type: "post", id: post.id })
                    }
                  />
                ))}
                {!posts.length && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                    No posts match this filter.
                  </div>
                )}
                {hasMore && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void loadPosts(offset)}
                    className="mx-auto flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-50"
                  >
                    {loading ? "Loading…" : "Load more"}
                  </button>
                )}
              </div>
            )}
          </main>
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-extrabold text-slate-800">
              Community guidelines
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-5 text-slate-500">
              <li>Explain your thinking so others can learn from it.</li>
              <li>Be specific, respectful, and constructive.</li>
              <li>Report content that is unsafe or misleading.</li>
            </ul>
          </aside>
        </div>
      </div>
      {showComposer && (
        <PostComposer
          onClose={() => setShowComposer(false)}
          onPublish={publish}
        />
      )}
      {reportTarget && (
        <ReportDialog
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
      {loadingThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
          <LoaderCircle className="animate-spin text-brand-primary" />
        </div>
      )}
    </>
  );
}
