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
            {/* Ancestors Chain - only render if user scrolled to top */}
            {showAncestors && ancestors.map((ancestor, index) => {
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

            {/* Button to load conversation */}
            {!showAncestors && ancestors.length > 0 && (
                <div
                    className="w-full border-b border-theme-border flex flex-col items-center justify-center cursor-pointer hover:bg-[#0a0a0a] transition-colors py-4"
                    onClick={() => setShowAncestors(true)}
                >
                    <div className="flex items-center gap-2 text-[var(--app-global-link-color)] text-sm font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span>Konuşmayı göster ({ancestors.length})</span>
                    </div>
                </div>
            )}

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
                    className="!border-b-0"
                    onCommentAdded={handleCommentAdded}
                    onPostDeleted={handlePostDeleted}
                />
            </div>

            {/* Yanit Yazma Alani */}
            {!isCommentBoxFocused ? (
                <div className="p-4 border-b border-theme-border bg-theme-bg pt-0">
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
                <div className="p-4 border-b border-theme-border bg-theme-bg">
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

            {/* Yanitlar - with nested replies support */}
            {hasReplies ? (
                <div>
                    {(() => {
                        // Recursive function to render reply with all its nested replies
                        const renderReplyWithNested = (reply: any, depth: number = 0): React.ReactNode => {
                            const nestedReplies = reply.comments || [];

                            return (
                                <div key={reply.id}>
                                    <div className="post-thread-item">
                                        <PostItem
                                            post={reply}
                                            showThreadLine={true}
                                            isFirstInThread={false}
                                            isLastInThread={nestedReplies.length === 0}
                                            isThread={false}
                                            showThreadFooter={false}
                                            currentUserId={currentUser?.id}
                                            currentUserRole={currentUser?.role}
                                            onPostDeleted={handlePostDeleted}
                                        />
                                    </div>
                                    {/* Render nested replies recursively */}
                                    {nestedReplies.length > 0 && (
                                        <div>
                                            {nestedReplies.map((nestedReply: any) =>
                                                renderReplyWithNested(nestedReply, depth + 1)
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        };

                        // Render all top-level replies with their nested threads
                        return allReplies.map((reply) => renderReplyWithNested(reply, 0));
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
