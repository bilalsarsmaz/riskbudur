"use client";

import { useState, useRef, useEffect } from "react";
import {
    IconX,
    IconPlayerPlayFilled,
    IconArrowLeft,
    IconVolume,
    IconVolumeOff,
    IconPlayerPause,
    IconHeart,
    IconHeartFilled,
    IconMessage2,
    IconRepeat,
    IconShare3,
    IconDots,
    IconTargetArrow,
    IconLibraryPlusFilled,
    IconTrash,
    IconTrashX,
    IconUserMinus,
    IconUserPlus,
    IconBan,
    IconFlag
} from "@tabler/icons-react";
import { createPortal } from "react-dom";
import { EnrichedPost } from "@/types/post";
import Link from "next/link";
import VerificationBadge from "./VerificationBadge";
import AdminBadge from "./AdminBadge";
import { hasPermission, Permission, Role } from "@/lib/permissions";

interface VideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
    post?: EnrichedPost;

    // Interaction State & Handlers
    isLiked?: boolean;
    likeCount?: number;
    commentCount?: number;
    quoteCount?: number;
    isQuoted?: boolean;
    isFollowing?: boolean;
    isBookmarked?: boolean;

    onLike?: () => void;
    onComment?: () => void;
    onQuote?: () => void;
    onShare?: () => void;
    onFollow?: () => void;
    onBookmark?: () => void;
    onDelete?: () => void;
    onBlock?: () => void;
    onReport?: () => void;
    currentUserId?: string;
    currentUserRole?: string;
}

export default function VideoPlayer({
    src,
    poster,
    className = "",
    post,
    isLiked,
    likeCount,
    commentCount,
    quoteCount,
    isQuoted,
    isFollowing,
    isBookmarked,
    onLike,
    onComment,
    onQuote,
    onShare,
    onFollow,
    onBookmark,
    onDelete,
    onBlock,
    onReport,
    currentUserId,
    currentUserRole
}: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false); // Default unmuted, but browsers might block autoplay w/ sound
    const [showCopiedToast, setShowCopiedToast] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Sync fullscreen video state with inline video state when opening
    useEffect(() => {
        if (isMobileFullscreen && fullscreenVideoRef.current && videoRef.current) {
            fullscreenVideoRef.current.currentTime = videoRef.current.currentTime;
            // Attempt autoplay
            fullscreenVideoRef.current.play().catch(e => console.log("Autoplay blocked", e));
            setIsPlaying(true);
        }
    }, [isMobileFullscreen]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    const handlePlayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isMobile) {
            setIsMobileFullscreen(true);
        } else {
            if (videoRef.current) {
                if (videoRef.current.paused) {
                    videoRef.current.play();
                    setIsPlaying(true);
                } else {
                    videoRef.current.pause();
                    setIsPlaying(false);
                }
            }
        }
    };

    const closeFullscreen = () => {
        // Sync time back to inline video
        if (fullscreenVideoRef.current && videoRef.current) {
            videoRef.current.currentTime = fullscreenVideoRef.current.currentTime;
        }
        setIsMobileFullscreen(false);
        setIsPlaying(false); // Pause when closing
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        setCurrentTime(e.currentTarget.currentTime);
        if (!duration) setDuration(e.currentTarget.duration);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (fullscreenVideoRef.current) {
            fullscreenVideoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (fullscreenVideoRef.current) {
            fullscreenVideoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleShareClick = () => {
        onShare?.();
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
    };

    // Helper for large numbers
    const formatNumber = (num?: number): string => {
        if (!num) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const isAnonymous = post?.isAnonymous || false;

    return (
        <>
            <div className={`relative rounded-2xl overflow-hidden border app-border bg-black ${className}`}>
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    className="w-full h-auto max-h-[440px] object-contain bg-black"
                    controls={!isMobile && isPlaying}
                    playsInline
                    onClick={handlePlayClick}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />

                {(!isPlaying || isMobile) && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer group"
                        onClick={handlePlayClick}
                    >
                        <div className="w-12 h-12 rounded-full bg-[var(--app-global-link-color)] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <IconPlayerPlayFilled className="w-6 h-6 text-white ml-1" />
                        </div>
                    </div>
                )}
            </div>

            {isMobileFullscreen && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in duration-200">
                    {/* Top Bar */}
                    <div className="absolute top-0 left-0 right-0 z-[100] p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent h-24">
                        <button
                            onClick={closeFullscreen}
                            className="p-2 -ml-2 text-white hover:opacity-80 transition-opacity"
                        >
                            <IconArrowLeft size={28} />
                        </button>
                    </div>

                    {/* Main Video Area */}
                    <div className="flex-1 relative flex items-center justify-center bg-black" onClick={() => {
                        if (fullscreenVideoRef.current) {
                            if (fullscreenVideoRef.current.paused) {
                                fullscreenVideoRef.current.play();
                                setIsPlaying(true);
                            } else {
                                fullscreenVideoRef.current.pause();
                                setIsPlaying(false);
                            }
                        }
                    }}>
                        <video
                            ref={fullscreenVideoRef}
                            src={src}
                            className="w-full h-full object-contain" // Use object-contain to enforce aspect ratio fitting
                            playsInline
                            onClick={(e) => {
                                e.stopPropagation();
                                if (fullscreenVideoRef.current) {
                                    if (fullscreenVideoRef.current.paused) {
                                        fullscreenVideoRef.current.play();
                                        setIsPlaying(true);
                                    } else {
                                        fullscreenVideoRef.current.pause();
                                        setIsPlaying(false);
                                    }
                                }
                            }}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                            onEnded={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Play/Pause Overlay Icon */}
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-black/40 rounded-full p-4">
                                    <IconPlayerPlayFilled size={48} className="text-white/80" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 z-[100] bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-6 px-4 flex flex-col gap-4">

                        {/* Time & Volume Row */}
                        <div className="flex items-center justify-between text-white/90 text-[13px] font-medium px-1">
                            <span>{formatTime(currentTime)} - {formatTime(duration)}</span>
                            <button onClick={toggleMute}>
                                {isMuted ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
                            </button>
                        </div>

                        {/* Play & Seeker Row */}
                        <div className="flex items-center gap-3">
                            <button onClick={(e) => {
                                e.stopPropagation();
                                if (fullscreenVideoRef.current) {
                                    fullscreenVideoRef.current.paused ? fullscreenVideoRef.current.play() : fullscreenVideoRef.current.pause();
                                }
                            }}>
                                {isPlaying ? <IconPlayerPause size={24} fill="white" /> : <IconPlayerPlayFilled size={24} fill="white" />}
                            </button>

                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>

                        {/* Author Info Row */}
                        {post && (
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/20 flex-shrink-0">
                                        <Link href={`/${post.author.nickname}`} onClick={(e) => e.stopPropagation()} className="block w-full h-full">
                                            <img
                                                src={isAnonymous ? "/Riskbudur-pp.png" : (post.author.profileImage || "/Riskbudur-first.png")}
                                                alt="avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </Link>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-white text-[16px] truncate">
                                                {isAnonymous ? 'Anonim Kullanıcı' : (post.author.fullName || post.author.nickname)}
                                            </span>
                                            {!isAnonymous && (
                                                <>
                                                    <VerificationBadge tier={post.author.verificationTier} hasBlueTick={post.author.hasBlueTick} className="w-4 h-4 ml-0.5 flex-shrink-0" />
                                                    <AdminBadge role={post.author.role} className="w-4 h-4 ml-0.5 flex-shrink-0" />
                                                </>
                                            )}
                                        </div>
                                        <span className="text-white/60 text-sm truncate">@{isAnonymous ? 'anonim' : post.author.nickname}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {!isAnonymous && onFollow && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onFollow(); }}
                                            className={`h-7 px-2 rounded-full text-[11px] font-bold border tracking-wider flex items-center justify-center transition-colors ${isFollowing ? 'border-white/40 text-black bg-white/90' : 'bg-transparent text-white border-white hover:bg-white/10'}`}
                                        >
                                            {isFollowing ? 'TAKİPTE' : 'KOVALA'}
                                        </button>
                                    )}
                                    <div className="relative">
                                        <button
                                            className="text-white p-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(!showMenu);
                                            }}
                                        >
                                            <IconDots size={20} />
                                        </button>

                                        {showMenu && (
                                            <div
                                                ref={menuRef}
                                                className="absolute bottom-full right-0 mb-2 rounded-xl border border-white/10 overflow-hidden"
                                                style={{
                                                    width: "260px",
                                                    backgroundColor: "#151515",
                                                    zIndex: 10000,
                                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {(currentUserId && post.author.id === currentUserId) ? (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDelete?.(); setShowMenu(false); }}
                                                            className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors hover:bg-white/5"
                                                        >
                                                            <IconTrash className="w-5 h-5 mr-3" />
                                                            Gönderiyi sil
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {currentUserId && currentUserRole && post.author.id !== currentUserId && hasPermission(currentUserRole as Role, Permission.DELETE_USER_POST) && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onDelete?.(); setShowMenu(false); }}
                                                                className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors border-b border-white/10 hover:bg-white/5"
                                                            >
                                                                <IconTrashX className="w-5 h-5 mr-3" />
                                                                Gönderiyi sil
                                                            </button>
                                                        )}
                                                        {!isAnonymous && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onFollow?.(); setShowMenu(false); }}
                                                                    className="w-full text-left px-4 py-3 flex items-center transition-colors text-white hover:bg-white/5"
                                                                >
                                                                    {isFollowing ? (
                                                                        <>
                                                                            <IconUserMinus className="w-5 h-5 mr-3" />
                                                                            @{post.author.nickname} kişisini takipten çıkar
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <IconUserPlus className="w-5 h-5 mr-3" />
                                                                            @{post.author.nickname} kişisini takip et
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onBlock?.(); setShowMenu(false); }}
                                                                    className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors hover:bg-white/5"
                                                                >
                                                                    <IconBan className="w-5 h-5 mr-3" />
                                                                    @{post.author.nickname} kişisini engelle
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onReport?.(); setShowMenu(false); }}
                                                            className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors hover:bg-white/5"
                                                        >
                                                            <IconFlag className="w-5 h-5 mr-3" />
                                                            Gönderiyi bildir
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Text Content */}
                        {post && post.content && (
                            <div className="text-white text-[15px] leading-snug line-clamp-3">
                                {post.content}
                            </div>
                        )}

                        {/* Interaction Bar - Full Set Matching PostItem */}
                        {post && (onLike || onComment || onQuote || onShare) && (
                            <div className="flex items-center justify-between pt-2 mt-1">
                                <div className="flex items-center gap-6">
                                    {/* Comment */}
                                    <button className="flex items-center gap-1 text-white group" onClick={(e) => { e.stopPropagation(); onComment?.(); }}>
                                        <IconMessage2 size={16} className="text-white group-active:scale-90 transition-transform" />
                                        {commentCount && commentCount > 0 ? <span className="text-sm font-bold">{formatNumber(commentCount)}</span> : null}
                                    </button>

                                    {/* Like */}
                                    <button className="flex items-center gap-1 text-white group" onClick={(e) => { e.stopPropagation(); onLike?.(); }}>
                                        {isLiked ? (
                                            <IconHeartFilled size={16} className="text-[#FF0066] group-active:scale-90 transition-transform" />
                                        ) : (
                                            <IconHeart size={16} className="text-white group-active:scale-90 transition-transform" />
                                        )}
                                        {likeCount && likeCount > 0 ? <span className={`text-sm font-bold ${isLiked ? "text-[#FF0066]" : "text-white"}`}>{formatNumber(likeCount)}</span> : null}
                                    </button>

                                    {/* Quote/Retweet */}
                                    <button className="flex items-center gap-1 text-white group" onClick={(e) => { e.stopPropagation(); onQuote?.(); }}>
                                        <IconRepeat size={16} className={`${isQuoted ? "text-[#1DCD9F]" : "text-white"} group-active:scale-90 transition-transform`} />
                                        {quoteCount && quoteCount > 0 ? <span className={`text-sm font-bold ${isQuoted ? "text-[#1DCD9F]" : "text-white"}`}>{formatNumber(quoteCount)}</span> : null}
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Bookmark - Target Icon */}
                                    <button className="flex items-center gap-1 text-white group" onClick={(e) => { e.stopPropagation(); onBookmark?.(); }}>
                                        <div className="p-1 rounded-full transition-colors" style={{ color: isBookmarked ? "#DC5F00" : "white" }}>
                                            <IconTargetArrow size={16} className={isBookmarked ? "" : "text-white"} />
                                        </div>
                                    </button>

                                    {/* Share - Library Plus Icon */}
                                    <button className="relative flex items-center gap-1 text-white group" onClick={(e) => { e.stopPropagation(); handleShareClick(); }}>
                                        <IconLibraryPlusFilled size={16} className="text-white group-active:scale-90 transition-transform" />

                                        {/* Copied Toast */}
                                        {showCopiedToast && (
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap animate-in fade-in zoom-in duration-200">
                                                Kopyalandı!
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
