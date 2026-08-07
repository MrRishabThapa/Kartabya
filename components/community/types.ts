export type Vote = 'up' | 'down' | null;

export interface CommunityAuthor {
  name: string;
  handle: string;
  initials: string;
  role?: 'Student' | 'Mentor';
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
}

export const scoreOf = (item: Pick<CommunityComment, 'upvotes' | 'downvotes'>) =>
  item.upvotes - item.downvotes;
