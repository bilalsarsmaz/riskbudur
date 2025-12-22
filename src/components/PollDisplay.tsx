"use client";

import { useState, useEffect } from "react";
import { IconCheck } from "@tabler/icons-react";
import { postApi } from "@/lib/api";

interface PollOption {
    id: string;
    text: string;
    voteCount: number;
    isVoted: boolean;
}

interface PollData {
    id: string;
    options: PollOption[];
    expiresAt: string | Date; // Can be string from JSON or Date object
    totalVotes: number;
    isVoted: boolean;
}

interface PollDisplayProps {
    poll: PollData;
    onVote?: (poll: PollData) => void;
    className?: string;
}

export default function PollDisplay({ poll: initialPoll, onVote, className = "" }: PollDisplayProps) {
    const [poll, setPoll] = useState<PollData>(initialPoll);
    const [isVoting, setIsVoting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isExpired, setIsExpired] = useState(false);

    // Parse expiresAt correctly
    const expiresAtDate = new Date(poll.expiresAt);

    // Sync state with props for persistence
    useEffect(() => {
        setPoll(initialPoll);
    }, [initialPoll]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const diff = expiresAtDate.getTime() - now.getTime();

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft("Anket sona erdi");
                return;
            }

            setIsExpired(false);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days} gün kaldı`);
            } else if (hours > 0) {
                setTimeLeft(`${hours} saat kaldı`);
            } else {
                setTimeLeft(`${minutes > 0 ? minutes : 1} dakika kaldı`);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [poll.expiresAt]);

    const handleVote = async (optionId: string) => {
        if (isExpired || poll.isVoted || isVoting) return;

        setIsVoting(true);
        try {
            const updatedPoll = await postApi<PollData>("/polls/vote", {
                pollId: poll.id,
                optionId,
            });

            setPoll(updatedPoll);
            if (onVote) {
                onVote(updatedPoll);
            }
        } catch (error) {
            console.error("Vote error:", error);
            // Optional: show error toast
        } finally {
            setIsVoting(false);
        }
    };

    const getPercentage = (count: number) => {
        if (poll.totalVotes === 0) return 0;
        return Math.round((count / poll.totalVotes) * 100);
    };

    // Determine if we should show results (voted or expired)
    const showResults = poll.isVoted || isExpired;

    return (
        <div className={`mt-3 w-full ${className}`}>
            <div className="flex flex-col gap-2">
                {poll.options.map((option) => {
                    const percentage = getPercentage(option.voteCount);
                    const isSelected = option.isVoted;

                    return (
                        <div
                            key={option.id}
                            className={`relative h-[42px] touch-manipulation rounded-full overflow-hidden flex items-center px-4 cursor-pointer transition-colors border ${showResults
                                ? (isSelected ? 'border-[var(--app-global-link-color)]' : 'border-transparent')
                                : 'border-[var(--app-global-link-color)] hover:bg-[#151515]'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!showResults) handleVote(option.id);
                            }}
                            style={{
                                backgroundColor: showResults ? 'rgba(255, 255, 255, 0.05)' : 'transparent' // Light background for result bars
                            }}
                        >
                            {/* Progress Bar Background */}
                            {showResults && (
                                <div
                                    className="absolute top-0 left-0 h-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: isSelected ? 'rgba(29, 205, 159, 0.2)' : 'rgba(128, 128, 128, 0.2)'
                                    }}
                                />
                            )}

                            <div className="flex items-center justify-between w-full relative z-10">
                                <span className="font-medium text-[15px] truncate mr-2" style={{ color: "var(--app-body-text)" }}>
                                    {option.text}
                                </span>
                                {showResults && (
                                    <span className="font-medium text-[15px]" style={{ color: "var(--app-body-text)" }}>
                                        {percentage}%
                                    </span>
                                )}
                            </div>

                            {isSelected && showResults && (
                                <div className="absolute right-2 bg-[var(--app-global-link-color)] rounded-full p-0.5 ml-2 hidden"> {/* Optional check mark */}
                                    <IconCheck size={12} className="text-black" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-2 text-[14px]" style={{ color: "var(--app-subtitle)" }}>
                <span>Toplam {poll.totalVotes} oy</span>
                <span className="mx-1">•</span>
                <span>{timeLeft}</span>
            </div>
        </div>
    );
}
