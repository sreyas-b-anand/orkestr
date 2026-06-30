"use client";

import { useState } from "react";
import {
  Copy,
  CheckCircle2,
  Heart,
  Repeat2,
  MessageCircle,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";

interface SocialThreadCardProps {
  posts: string[];
  /** Campaign / product name — used as the posting account name */
  campaignName?: string;
}

// X (Twitter) logo SVG
function XLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Derive a clean @handle from any string */
function toHandle(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 15);
  return `@${slug || "orkestr_ai"}`;
}

/** First character of campaign name, upper-cased */
function avatarLetter(name: string): string {
  return (name?.trim()[0] ?? "O").toUpperCase();
}

function Tweet({
  post,
  index,
  total,
  accountName,
  handle,
}: {
  post: string;
  index: number;
  total: number;
  accountName: string;
  handle: string;
}) {
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Deterministic engagement numbers — no Math.random (avoids hydration errors)
  const likes = 23 + index * 11;
  const retweets = 7 + index * 4;
  const replies = 2 + index * 3;
  const views = 890 + index * 234;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    toast.success("Tweet copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Thread connector line */}
      {index < total - 1 && (
        <div className="absolute left-[19px] top-[52px] bottom-0 w-0.5 bg-border z-0" />
      )}

      <div className="flex gap-3 py-4 relative z-10">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm select-none">
            {avatarLetter(accountName)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name + handle row */}
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="text-sm font-bold text-foreground">
              {accountName}
            </span>
            {/* Verified badge */}
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-500">
              <CheckCircle2 className="w-2.5 h-2.5 text-white stroke-[3]" />
            </span>
            <span className="text-sm text-muted-foreground">{handle}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-sm text-muted-foreground">Just now</span>
            {total > 1 && (
              <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {index + 1} / {total}
              </span>
            )}
          </div>

          {/* Tweet body */}
          <p className="text-sm text-foreground leading-relaxed mb-3">{post}</p>

          {/* Engagement bar */}
          <div className="flex items-center gap-5 text-muted-foreground">
            <button className="flex items-center gap-1.5 text-xs hover:text-sky-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{replies}</span>
            </button>
            <button
              onClick={() => setRetweeted(!retweeted)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                retweeted ? "text-emerald-500" : "hover:text-emerald-500"
              }`}
            >
              <Repeat2 className="w-4 h-4" />
              <span>{retweets + (retweeted ? 1 : 0)}</span>
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                liked ? "text-rose-500" : "hover:text-rose-500"
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-all ${liked ? "fill-rose-500 scale-110" : ""}`}
              />
              <span>{likes + (liked ? 1 : 0)}</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-sky-500 transition-colors">
              <BarChart2 className="w-4 h-4" />
              <span>{views.toLocaleString()}</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors ml-auto"
              title="Copy tweet"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SocialThreadCard({ posts, campaignName }: SocialThreadCardProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const accountName = campaignName?.trim() || "Orkestr";
  const handle = toHandle(accountName);

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(posts.join("\n\n---\n\n"));
    setCopiedAll(true);
    toast.success("All posts copied");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="section-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center shrink-0">
            <XLogo className="w-4 h-4 text-background" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Social Media Thread
            </h2>
            <p className="text-xs text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? "s" : ""} · {handle}
            </p>
          </div>
        </div>
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary border border-border hover:border-primary/30 rounded-lg px-3 py-1.5 transition-all hover:bg-primary/5"
        >
          {copiedAll ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copiedAll ? "Copied" : "Copy All"}
        </button>
      </div>

      {/* Tweets */}
      <div className="px-6 divide-y divide-border/60">
        {posts.map((post, i) => (
          <Tweet
            key={i}
            post={post}
            index={i}
            total={posts.length}
            accountName={accountName}
            handle={handle}
          />
        ))}
      </div>

      {/* Footer note */}
      <div className="px-6 py-3 border-t border-border bg-muted/30">
        <p className="text-[11px] text-muted-foreground">
          AI-generated content — review before publishing to your account.
        </p>
      </div>
    </div>
  );
}
