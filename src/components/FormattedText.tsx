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

    return (
        <div className={className}>
            {lines.map((line, lineIndex) => {
                // Tokenize the line
                // We will process the line through multiple regexes recursively or sequentially
                // A simple approach is to split by one regex, then map and split by the next, etc.

                // Let's create a custom parser function for a single line
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
                            // Note: split with capturing group includes the captured group in the array
                            // Odd indices will be the captures (mentions)
                            // This depends on browser implementation, but usually: "hi @foo" -> ["hi ", "foo", ""]

                            // Actually, simply matching might be safer if we want to handle the @ symbol correctly.
                            // Let's re-approach. Split logic with capturing group:
                            // "a @b c".split(/@(\w+)/) -> ["a ", "b", " c"]

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
                    <p key={lineIndex} className="min-h-[1.2em]">
                        {parseLine(line)}
                    </p>
                );
            })}
        </div>
    );
}
