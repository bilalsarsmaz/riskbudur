"use client";

import PostItem from "./PostItem";

interface Author {
  id: string;
  nickname: string;
  hasBlueTick: boolean;
}

interface PostCount {
  likes: number;
  comments: number;
}

export interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  imageUrl?: string;
  createdAt: string;
  author: Author;
  _count: PostCount;
  isLiked?: boolean;
}

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Henüz hiç post yok.</p>
        <p className="mt-2 text-sm text-gray-400">İlk postu paylaşan sen ol!</p>
      </div>
    );
  }

  return (
    <div className="border border-[#2a2a2a] rounded-b-lg bg-white">
      {posts.map((post, index) => (
        <PostItem key={post.id} post={post} isFirst={index === 0} />
      ))}
    </div>
  );
} 