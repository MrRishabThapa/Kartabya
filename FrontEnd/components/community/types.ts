export type Vote = "up" | "down" | null;

export interface CommunityAuthor {
  id?: string;
  name: string;
  handle: string;
  initials: string;
  role?: "Student" | "Mentor";
  avatar_url?: string | null;
}

export interface CommunityComment {
  id: string;
  author: CommunityAuthor;
  body: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  vote: Vote;
  replies?: CommunityComment[];
}

export interface CommunityPost {
  id: string;
  author: CommunityAuthor;
  title: string;
  body: string;
  topic: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  imageUrl?: string;
  comments: CommunityComment[];
  commentCount?: number;
}

export const scoreOf = (
  item: Pick<CommunityComment, "upvotes" | "downvotes">,
) => item.upvotes - item.downvotes;
