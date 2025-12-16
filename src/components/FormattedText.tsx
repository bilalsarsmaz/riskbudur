import Link from "next/link";
import React from "react";

interface FormattedTextProps {
    text: string;
    className?: string;
}

export default function FormattedText({ text, className = "" }: FormattedTextProps) {
    if (!text) return null;

    // Regex definitions
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const boldRegex = /\*([^*]+)\*/g;
    const italicRegex = /_([^_]+)_/g;

    // Split text by lines to preserve newlines
    const lines = text.split('\n');

    const parseLine = (content: string) => {
        // Step 1: Split by URL
        const parts = content.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={`link-${i}`}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline transition-colors"
                        style={{ color: "var(--app-global-link-color)" }}
                    >
                        {part}
                    </a>
                );
            }

            // Step 2: Split by Mention
            const subParts = part.split(mentionRegex);
            return subParts.map((subPart, j) => {
                if (j % 2 === 1) { // This is a mention (captured group without @)
                    const username = subPart;
                    return (
                        <Link
                            key={`mention-${i}-${j}`}
                            href={`/${username}`}
                            className="hover:underline transition-colors"
                            style={{ color: "var(--app-global-link-color)" }}
                        >
                            @{username}
                        </Link>
                    );
                }

                // Step 3: Bold
                const boldParts = subPart.split(boldRegex);
                return boldParts.map((boldPart, k) => {
                    if (k % 2 === 1) {
                        return <strong key={`bold-${i}-${j}-${k}`}>{boldPart}</strong>;
                    }

                    // Step 4: Italic
                    const italicParts = boldPart.split(italicRegex);
                    return italicParts.map((italicPart, l) => {
                        if (l % 2 === 1) {
                            return <em key={`italic-${i}-${j}-${k}-${l}`}>{italicPart}</em>;
                        }
                        return <span key={`text-${i}-${j}-${k}-${l}`}>{italicPart}</span>;
                    });
                });
            });
        });
    };

    return (
        <div className={className}>
            {lines.map((line, lineIndex) => (
                <p key={lineIndex} className="min-h-[1.2em]">
                    {parseLine(line)}
                </p>
            ))}
        </div>
    );
}
