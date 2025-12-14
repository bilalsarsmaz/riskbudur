"use client";

import PostItem from "./PostItem";
import { EnrichedPost } from "@/types/post";

interface PostListProps {
  posts: EnrichedPost[];
  currentUserId?: string;
  onPostDeleted?: (post: EnrichedPost) => void;
  onPostCreated?: (post: EnrichedPost) => void;
}

export default function PostList({ posts, currentUserId, onPostDeleted, onPostCreated }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Henüz hiç post yok.</p>
        <p className="mt-2 text-sm text-gray-400">İlk postu paylaşan sen ol!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {posts.map((post, index) => (
        <PostItem
          key={post.id}
          post={post}
          isFirst={index === 0}
          currentUserId={currentUserId}
          onPostDeleted={onPostDeleted}
          onPostCreated={onPostCreated}
          isThread={post.isThread || false}
          showThreadFooter={true}
        />
      ))}
    </div>
  );
}
