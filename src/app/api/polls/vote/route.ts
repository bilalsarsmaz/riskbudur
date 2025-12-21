
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { pollId, optionId } = await req.json();

        if (!pollId || !optionId) {
            return NextResponse.json({ error: "Missing pollId or optionId" }, { status: 400 });
        }

        // Start transaction to verify poll state and cast vote atomically
        const updatedPoll = await prisma.$transaction(async (tx) => {
            // 1. Fetch poll to check expiry and existence
            const poll = await tx.poll.findUnique({
                where: { id: pollId },
                include: { votes: { where: { userId } } }
            });

            if (!poll) {
                throw new Error("Poll not found");
            }

            if (new Date() > poll.expiresAt) {
                throw new Error("Poll has expired");
            }

            // 2. Check if user already voted
            if (poll.votes.length > 0) {
                throw new Error("User already voted");
            }

            // 3. Create vote
            await tx.pollVote.create({
                data: {
                    pollId,
                    optionId,
                    userId
                }
            });

            // 4. Increment vote count on option
            await tx.pollOption.update({
                where: { id: optionId },
                data: { voteCount: { increment: 1 } }
            });

            // 5. Return updated poll structure
            return tx.poll.findUnique({
                where: { id: pollId },
                include: {
                    options: {
                        orderBy: { id: 'asc' }
                    },
                    votes: { where: { userId } }
                }
            });
        });

        if (!updatedPoll) throw new Error("Failed to fetch updated poll");

        // Format response consistent with frontend expectations
        return NextResponse.json({
            id: updatedPoll.id,
            options: updatedPoll.options.map(opt => ({
                id: opt.id,
                text: opt.text,
                voteCount: opt.voteCount,
                isVoted: updatedPoll.votes.some(v => v.optionId === opt.id)
            })),
            expiresAt: updatedPoll.expiresAt,
            totalVotes: updatedPoll.options.reduce((acc, curr) => acc + curr.voteCount, 0),
            isVoted: true
        });

    } catch (error) {
        console.error("Vote error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
