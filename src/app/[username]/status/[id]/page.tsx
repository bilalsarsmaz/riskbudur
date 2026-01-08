"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PostItem from "@/components/PostItem";
import CommentComposeBox from "@/components/CommentComposeBox";
import { fetchApi } from "@/lib/api";
import { EnrichedPost } from "@/types/post";
import GlobalHeader from "@/components/GlobalHeader";
import StandardPageLayout from "@/components/StandardPageLayout";

interface ReplyPost extends EnrichedPost {
    replies?: ReplyPost[];
}

interface PostWithReplies extends EnrichedPost {
    comments: ReplyPost[];
    threadRepliesCount?: number;
    parentPost?: {
        id: string;
        content: string;
        author: {
            id: string;
            nickname: string;
            fullName?: string;
        };
    };
}

interface CurrentUser {
    id: string;
    nickname: string;
    profileImage?: string;
    role?: string;
}

// Tum yanitlari duz liste haline getir (nested'i flatten et)
const flattenReplies = (replies: ReplyPost[]): ReplyPost[] => {
    const result: ReplyPost[] = [];

    const processReply = (reply: ReplyPost) => {
        result.push(reply);
        if (reply.replies && reply.replies.length > 0) {
            reply.replies.forEach(processReply);
        }
    };

    replies.forEach(processReply);
    return result;
};

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id as string;

    const [post, setPost] = useState<PostWithReplies | null>(null);
    const [ancestors, setAncestors] = useState<EnrichedPost[]>([]);
    const heroRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLElement>(null); // For listening to timeline scroll
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("userInfo");
            try {
                return saved ? JSON.parse(saved) : null;
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCommentBoxFocused, setIsCommentBoxFocused] = useState(false);
    const [hasScrolledToHero, setHasScrolledToHero] = useState(false);

    const [imageError, setImageError] = useState(false);

    // Derived state for rendering
    const allReplies = post?.comments ? flattenReplies(post.comments) : [];
    const hasReplies = allReplies.length > 0;
    const isThread = (post?.threadRepliesCount || 0) >= 4;

    useEffect(() => {
        // Disable browser auto-scroll restoration to ensure we control the focus
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        const fetchConversation = async () => {
            try {
                const data = await fetchApi(`/posts/${postId}/conversation`);

                // Adapt to existing state structure
                // backend returns { mainPost, ancestors, replies }
                // frontend expects post.comments for replies logic
                const postData = { ...data.mainPost, comments: data.replies };

                setPost(postData);
                setAncestors(data.ancestors);
                setError(null);
            } catch (err) {
                setError("Post yuklenirken bir hata olustu.");
                console.error("Post yukleme hatasi:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchCurrentUser = async () => {
            try {
                const userData = await fetchApi("/users/me");
                setCurrentUser(userData);
                if (userData) {
                    localStorage.setItem("userInfo", JSON.stringify(userData));
                }
            } catch (err) {
                console.error("Kullanici bilgileri alinamadi:", err);
            }
        };

        if (postId) {
            fetchConversation();
            fetchCurrentUser();
        }
    }, [postId]);

    // State for controlling when to show ancestors
    const [showAncestors, setShowAncestors] = useState(false);

    const handleCommentAdded = (newComment?: any) => {
        if (newComment && post) {
            const newReply: ReplyPost = {
                ...newComment,
                replies: [],
                comments: [] // Ensure compatibility with ReplyPost interface
            };

            setPost({
                ...post,
                comments: [newReply, ...(post.comments || [])]
            });
            setIsCommentBoxFocused(false);
        } else {
            window.location.reload();
        }
    };

    const LoadingContent = () => (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--app-global-link-color)]"></div>
        </div>
    );

    const ErrorContent = () => (
        <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error || "Post bulunamadi"}</p>
            <button
                onClick={() => router.push("/home")}
                className="px-4 py-2 rounded-lg text-white font-medium bg-[var(--app-global-link-color)]"
            >
                Ana Sayfaya Don
            </button>
        </div>
    );

    const handlePostDeleted = (deletedPost: EnrichedPost) => {
        // Eger silinen post bu sayfanin ana postu ise
        if (deletedPost.id === post?.id) {
            // Ana sayfaya veya bir onceki sayfaya yonlendir
            router.push('/home');
            return;
        }

        // Eger silinen bir yorum ise listeden cikar (recursive filter)
        if (post) {
            // Helper function to recursively remove logic
            const removePostFromTree = (items: any[]): any[] => {
                return items.filter(item => {
                    if (item.id === deletedPost.id) return false;

                    // PostWithReplies uses 'comments' for nested replies in this specific page architecture
                    if (item.comments && item.comments.length > 0) {
                        item.comments = removePostFromTree(item.comments);
                    }
                    // Some interfaces might use 'replies'
                    if (item.replies && item.replies.length > 0) {
                        item.replies = removePostFromTree(item.replies);
                    }
                    return true;
                });
            }

            setPost({
                ...post,
                comments: removePostFromTree(post.comments)
            });
        }
    };

    // Main Content Logic (Inlined to prevent Remounts)
    const postDetailContent = post ? (
        <>
            {/* Ancestors Chain - X.com pattern: Always show inline */}
            {ancestors.length > 0 && ancestors.map((ancestor, index) => {
                return (
                    <div key={ancestor.id} className="post-thread-item">
                        <PostItem
                            post={ancestor}
                            isFirst={index === 0}
                            showThreadLine={true}
                            isFirstInThread={index === 0}
                            isLastInThread={false}
                            isThread={true}
                            showThreadFooter={false}
                            currentUserId={currentUser?.id}
                            currentUserRole={currentUser?.role}
                            onPostDeleted={handlePostDeleted}
                        />
                    </div>
                );
            })}

            {/* Ana Post (Hero) */}
            {/* Wrapped in ref for scrolling via ID or Ref */}
            <div
                id="focus-hero"
                ref={heroRef}
                className="post-detail-card post-thread-root scroll-mt-[100px]"
            >
                <PostItem
                    post={post}
                    isFirst={ancestors.length === 0} // First only if no ancestors
                    showThreadLine={ancestors.length > 0} // Show line if coming from ancestors
                    isFirstInThread={ancestors.length === 0}
                    isLastInThread={!hasReplies}
                    isThread={isThread || ancestors.length > 0}
                    showThreadFooter={false}
                    currentUserId={currentUser?.id}
                    currentUserRole={currentUser?.role}
                    isHero={true}
                    className="sm:!border-b-0 border-b border-theme-border"
                    onCommentAdded={handleCommentAdded}
                    onPostDeleted={handlePostDeleted}
                />
            </div>

            {/* Yanit Yazma Alani - Sadece Desktop/Tablet */}
            <div className="hidden sm:block">
                {!isCommentBoxFocused ? (
                    <div className="py-[11px] px-[13px] border-b border-theme-border bg-theme-bg">
                        <div className="flex items-center justify-between">
                            <div
                                onClick={() => setIsCommentBoxFocused(true)}
                                className="flex items-center flex-1 cursor-pointer hover:bg-[#151515] p-2 rounded-lg"
                            >
                                {currentUser?.profileImage && !imageError ? (
                                    <img
                                        src={currentUser.profileImage}
                                        alt={currentUser.nickname}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mr-3"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3">
                                        {currentUser?.nickname?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                )}
                                <span style={{ color: "#6e767d" }}>Yanıtını yaz...</span>
                            </div>
                            <button
                                disabled
                                className="px-4 py-2 rounded-full text-black font-medium opacity-50 cursor-not-allowed bg-[var(--app-global-link-color)]"
                            >
                                Yanıtla
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-[11px] px-[13px] border-b border-theme-border bg-theme-bg">
                        {(() => {
                            if (!post) return null;

                            const mentions = new Set<string>();
                            if (post.author) mentions.add(post.author.nickname);

                            if (post.content) {
                                const mentionRegex = /@([a-zA-Z0-9_]+)/g;
                                const matches = post.content.match(mentionRegex);
                                if (matches) {
                                    matches.forEach(match => mentions.add(match.substring(1)));
                                }
                            }

                            // Also check ancestors (thread history) if available
                            // Since we are in the detail page, 'ancestors' state holds the thread history.
                            if (ancestors && ancestors.length > 0) {
                                ancestors.forEach(ancestor => {
                                    if (ancestor.author) mentions.add(ancestor.author.nickname);
                                    if (ancestor.content) {
                                        const matches = ancestor.content.match(/@([a-zA-Z0-9_]+)/g);
                                        if (matches) matches.forEach(m => mentions.add(m.substring(1)));
                                    }
                                });
                            }

                            let recipients = Array.from(mentions);
                            // Ensure main author is first
                            if (post.author) {
                                recipients = recipients.filter(r => r !== post.author.nickname);
                                recipients.unshift(post.author.nickname);
                            }

                            if (recipients.length === 0) return null;

                            let text;
                            if (recipients.length === 1) {
                                text = <span className="text-sm text-gray-500">@{recipients[0]} adlı kullanıcıya yanıt olarak</span>;
                            } else {
                                text = (
                                    <span className="text-sm text-gray-500">
                                        <span className="text-[var(--app-global-link-color)]">@{recipients[0]}</span> ve diğer kullanıcılara yanıt olarak
                                    </span>
                                );
                            }

                            return (
                                <div className="mb-2 ml-[52px]">
                                    {text}
                                </div>
                            );
                        })()}
                        <CommentComposeBox
                            postId={postId}
                            onCommentAdded={handleCommentAdded}
                            onCancel={() => setIsCommentBoxFocused(false)}
                            hideAvatar={true}
                            textareaClassName="border-0 focus:ring-0"
                        />
                    </div>
                )}
            </div>

            {/* Yanitlar - with nested replies support */}
            {hasReplies ? (
                <div>
                    {(() => {
                        // HYBRID DISPLAY LOGIC (X.com pattern):
                        // - If focus is ROOT (no ancestors): Show only 1st level replies
                        // - If focus is REPLY (has ancestors): Show full recursive tree with thread lines
                        const isReplyFocus = ancestors.length > 0;

                        if (isReplyFocus) {
                            // Recursive function for full conversation tree
                            const renderReplyWithNested = (reply: any, depth: number = 0, isFirst: boolean = true, isLast: boolean = true): React.ReactNode => {
                                const nestedReplies = reply.comments || [];
                                const hasNested = nestedReplies.length > 0;
                                // Show thread line if: has children OR is not the first in chain (connects to parent)
                                const shouldShowLine = hasNested || depth > 0;
                                // This is the absolute last post in the tree if: no nested replies AND isLast
                                const isAbsolutelyLast = !hasNested && isLast;

                                return (
                                    <div key={reply.id}>
                                        <PostItem
                                            post={reply}
                                            showThreadLine={shouldShowLine}
                                            isFirstInThread={depth === 0 && hasNested}
                                            isLastInThread={!hasNested}
                                            isThread={shouldShowLine && !isAbsolutelyLast}
                                            showThreadFooter={false}
                                            currentUserId={currentUser?.id}
                                            currentUserRole={currentUser?.role}
                                            onPostDeleted={handlePostDeleted}
                                            hasActiveThread={hasNested}
                                        />
                                        {/* Render nested replies recursively */}
                                        {hasNested && (
                                            <div>
                                                {nestedReplies.map((nestedReply: any, idx: number) =>
                                                    renderReplyWithNested(
                                                        nestedReply,
                                                        depth + 1,
                                                        false,
                                                        isLast && idx === nestedReplies.length - 1 // Only last if parent is last AND this is the last child
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            };

                            return allReplies.map((reply, idx) => renderReplyWithNested(reply, 0, true, idx === allReplies.length - 1));
                        } else {
                            // 1st level only for ROOT posts
                            return allReplies.map((reply: any) => {
                                const nestedReplies = reply.comments || [];
                                const hasActiveThread = nestedReplies.length > 0;

                                return (
                                    <div key={reply.id}>
                                        <PostItem
                                            post={reply}
                                            showThreadLine={false}
                                            isFirstInThread={false}
                                            isLastInThread={true}
                                            isThread={false}
                                            showThreadFooter={false}
                                            currentUserId={currentUser?.id}
                                            currentUserRole={currentUser?.role}
                                            onPostDeleted={handlePostDeleted}
                                            hasActiveThread={hasActiveThread}
                                        />
                                    </div>
                                );
                            });
                        }
                    })()}
                </div>
            ) : (
                <div className="p-8 text-center" style={{ color: "#6e767d" }}>
                    Henüz kimse yanıt vermemiş.
                </div>
            )}
        </>
    ) : null;

    // Render helper to include Global Header in Loading/Error states if we wanted, 
    // but the current structure has separate full-page returns for Loading/Error.
    // We will just update those returns + the main return.

    if (loading) {
        return (
            <StandardPageLayout>
                <GlobalHeader
                    title="Gönderi Detayı"
                    onBack={() => router.back()}
                    style={{ height: "60px" }}
                />
                <LoadingContent />
            </StandardPageLayout>
        );
    }

    if (error || !post) {
        return (
            <StandardPageLayout>
                <GlobalHeader
                    title="Gönderi Detayı"
                    onBack={() => router.back()}
                    style={{ height: "60px" }}
                />
                <ErrorContent />
            </StandardPageLayout>
        );
    }

    return (
        <StandardPageLayout>
            <GlobalHeader
                title="Gönderi Detayı"
                onBack={() => router.back()}
                style={{ height: "60px" }}
            />
            {postDetailContent}
        </StandardPageLayout>
    );
}
