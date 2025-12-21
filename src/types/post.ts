export interface Author {
    id: string;
    nickname: string;
    fullName?: string;
    profileImage?: string;
    hasBlueTick: boolean;
    verificationTier?: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
}

export interface LinkPreview {
    url: string;
    title: string;
    description?: string;
    thumbnail?: string;
    siteName?: string;
    type?: 'youtube' | 'summary_large_image' | 'website';
    videoId?: string;
}

export interface PostCount {
    likes: number;
    comments: number;
    quotes: number;
}

export interface PollOption {
    id: string;
    text: string;
    voteCount: number;
    isVoted: boolean;
}

export interface PollData {
    id: string;
    options: PollOption[];
    expiresAt: string | Date;
    totalVotes: number;
    isVoted: boolean;
}

export interface EnrichedPost {
    id: string;
    content: string;
    mediaUrl?: string;
    imageUrl?: string;
    createdAt: string | Date;
    author: Author;
    _count: PostCount;

    // Interaction states
    isLiked?: boolean;
    isBookmarked?: boolean;
    isQuoted?: boolean;
    isReposted?: boolean;
    isCommented?: boolean;

    // Feature flags
    isAnonymous?: boolean;
    isThread?: boolean;
    isPopular?: boolean;

    // Rich content
    linkPreview?: LinkPreview;
    mentionedUsers?: string[];
    poll?: PollData | null;

    // Threading / Relations
    parentPostId?: string;
    threadRootId?: string;
    quotedPost?: EnrichedPost;
    quotedPostId?: string;

    // Legacy/Optional - keeping for compatibility if generic 'Post' is used elsewhere
    quoteCount?: number;
}
