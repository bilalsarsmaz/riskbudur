import { useEffect, useRef, useState } from "react";

interface UseViewTrackingOptions {
    enabled?: boolean;
    threshold?: number;
    delay?: number;
}

/**
 * Track post views using Intersection Observer API
 * Only counts when post is 50%+ visible for 1+ second
 */
export function useViewTracking(
    postId: string,
    options: UseViewTrackingOptions = {}
) {
    const {
        enabled = true,
        threshold = 0.5,
        delay = 1000
    } = options;

    const elementRef = useRef<HTMLDivElement>(null);
    const [hasViewed, setHasViewed] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isVisibleRef = useRef<boolean>(false);

    // Session-based cache to prevent counting same post twice
    const viewedPostsRef = useRef<Set<string>>(
        typeof window !== 'undefined'
            ? new Set(JSON.parse(sessionStorage.getItem('viewedPosts') || '[]'))
            : new Set()
    );

    useEffect(() => {
        // Don't track if disabled, already viewed, or previously viewed in session
        if (!enabled || hasViewed || viewedPostsRef.current.has(postId)) {
            console.log(`[ViewTracking] Skipping post ${postId}:`, { enabled, hasViewed, alreadyViewed: viewedPostsRef.current.has(postId) });
            return;
        }

        const element = elementRef.current;
        if (!element) {
            console.log(`[ViewTracking] No element ref for post ${postId}`);
            return;
        }

        console.log(`[ViewTracking] Setting up observer for post ${postId}`);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    console.log(`[ViewTracking] Post ${postId} intersection:`, {
                        isIntersecting: entry.isIntersecting,
                        ratio: entry.intersectionRatio,
                        threshold
                    });

                    if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
                        // Post is visible - update state and start timer
                        isVisibleRef.current = true;
                        console.log(`[ViewTracking] Post ${postId} visible, starting ${delay}ms timer`);

                        // Clear any existing timer
                        if (timerRef.current) {
                            clearTimeout(timerRef.current);
                        }

                        timerRef.current = setTimeout(() => {
                            // Check if STILL visible using ref (not stale closure)
                            console.log(`[ViewTracking] Post ${postId} timer fired, still visible:`, isVisibleRef.current);
                            if (isVisibleRef.current) {
                                trackView(postId);
                            }
                        }, delay);
                    } else {
                        // Post left viewport - update state and cancel timer
                        isVisibleRef.current = false;
                        console.log(`[ViewTracking] Post ${postId} left viewport, canceling timer`);
                        if (timerRef.current) {
                            clearTimeout(timerRef.current);
                            timerRef.current = null;
                        }
                    }
                });
            },
            {
                threshold,
                // Optional: rootMargin for earlier/later triggering
                // rootMargin: '0px 0px -10% 0px' // Trigger when 10% from bottom
            }
        );

        observer.observe(element);

        return () => {
            console.log(`[ViewTracking] Cleaning up observer for post ${postId}`);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            observer.disconnect();
        };
    }, [postId, enabled, hasViewed, threshold, delay]);

    const trackView = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            const headers: HeadersInit = {
                "Content-Type": "application/json"
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/posts/${id}/view`, {
                method: "POST",
                headers
            });

            if (response.ok) {
                setHasViewed(true);
                viewedPostsRef.current.add(id);

                // Persist to sessionStorage
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(
                        'viewedPosts',
                        JSON.stringify(Array.from(viewedPostsRef.current))
                    );
                }
            }
        } catch (error) {
            console.error("Failed to track view:", error);
        }
    };

    return { elementRef, hasViewed };
}
