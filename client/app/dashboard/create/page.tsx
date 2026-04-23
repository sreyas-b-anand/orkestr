"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { generateCampaign } from "@/lib/api";
import { useWebSocket}from "@/hooks/use-websocket";
import { ChatBubble } from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Loader2,
  Send,
  Copy,
  Download,
  CheckCircle2,
  Bot,
  FileText,
  Mail,
  MessageSquare,
} from "lucide-react";


export default function CreateCampaignPage() {
  const [sourceText, setSourceText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [copied, setCopied] = useState(false);

  const { messages, connect, disconnect, clearMessages } = useWebSocket();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter source text");
      return;
    }

    setGenerating(true);
    setResult(null);
    clearMessages();

    connect();

    try {
      const res = await generateCampaign(sourceText.trim());
      setResult(res.output);
      toast.success("Campaign generated successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Generation failed";
      toast.error(message);
    } finally {
      setGenerating(false);
      disconnect();
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded campaign kit");
  };

  const drafts = result?.drafts as
    | { blog_post: string; social_thread: string[]; email_teaser: string }
    | undefined;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create Campaign
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste your product text and watch AI agents collaborate in real time
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        
        <div className="space-y-4">
          {/* Source text input */}
          <div className="glass-card rounded-2xl p-5">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Source Text
            </label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste your product description, marketing brief, or raw text here…"
              rows={8}
              disabled={generating}
              className="w-full bg-muted/30 rounded-xl border border-border p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all disabled:opacity-50"
            />
            <Button
              onClick={handleGenerate}
              disabled={generating || !sourceText.trim()}
              className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary gap-2 h-11"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Campaign
                </>
              )}
            </Button>
          </div>

          {/* Live Chat Feed */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Agent Chat Feed
              </span>
              {generating && (
                <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <ScrollArea className="h-87.5">
              <div className="p-4 space-y-3">
                {messages.length === 0 && !generating && (
                  <p className="text-xs text-muted-foreground text-center py-12">
                    Agent conversations will appear here when you generate a
                    campaign
                  </p>
                )}
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, i) => (
                    <ChatBubble key={i} message={msg} />
                  ))}
                </AnimatePresence>
                {generating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((j) => (
                        <motion.span
                          key={j}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: j * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Agents working…
                    </span>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="space-y-4">
          {!result && !generating && (
            <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Campaign output
              </h3>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Your generated blog post, social thread, and email teaser will
                appear here
              </p>
            </div>
          )}

          {generating && !result && (
            <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">
                AI agents are working on your campaign…
              </p>
            </div>
          )}

          {result && drafts && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Status badge */}
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`${
                    (result.status as string) === "approved"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/25"
                  } text-xs font-semibold uppercase tracking-wider`}
                >
                  {(result.status as string) || "complete"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {result.iterations as number} iterations
                </span>
              </div>

              {/* Tabs for outputs */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <Tabs defaultValue="blog" className="w-full">
                  <div className="px-4 pt-3">
                    <TabsList className="w-full bg-muted/50">
                      <TabsTrigger
                        value="blog"
                        className="flex-1 gap-1.5 text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Blog Post
                      </TabsTrigger>
                      <TabsTrigger
                        value="social"
                        className="flex-1 gap-1.5 text-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Social
                      </TabsTrigger>
                      <TabsTrigger
                        value="email"
                        className="flex-1 gap-1.5 text-xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="blog" className="mt-0">
                    <ScrollArea className="h-[350px]">
                      <div className="p-5">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {drafts.blog_post}
                        </p>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="social" className="mt-0">
                    <ScrollArea className="h-[350px]">
                      <div className="p-5 space-y-3">
                        {drafts.social_thread?.map(
                          (post: string, i: number) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-muted/30 border border-border"
                            >
                              <p className="text-[10px] text-muted-foreground mb-1 font-medium">
                                Post {i + 1}
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">
                                {post}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="email" className="mt-0">
                    <ScrollArea className="h-[350px]">
                      <div className="p-5">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {drafts.email_teaser}
                        </p>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Export actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs border-border hover:border-primary/30 hover:text-primary"
                  onClick={() =>
                    handleCopy(JSON.stringify(drafts, null, 2))
                  }
                >
                  {copied ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy All"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs border-border hover:border-primary/30 hover:text-primary"
                  onClick={handleDownload}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download JSON
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}