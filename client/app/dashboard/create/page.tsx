"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { generateCampaign } from "@/lib/api";
import { useWebSocket } from "@/hooks/use-websocket";
import { ChatBubble } from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContentSection } from "@/components/campaign/ContentSection";
import { SocialThreadCard } from "@/components/campaign/SocialThreadCard";
import { FactSheetCard } from "@/components/campaign/FactSheetCard";
import { ReviewCard } from "@/components/campaign/ReviewCard";
import { EmailCard } from "@/components/campaign/EmailCard";
import { downloadCampaignAsPdf } from "@/lib/export-pdf";
import {
  Loader2,
  Send,
  Download,
  Bot,
  Megaphone,
  FileText,
  IterationCcw,
} from "lucide-react";
import { ReviewSection, Campaign } from "@/types/campaign";

export default function CreateCampaignPage() {
  const [campaignName, setCampaignName] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const { messages, connect, disconnect, clearMessages } = useWebSocket();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign or product name");
      return;
    }
    if (!sourceText.trim()) {
      toast.error("Please enter source text");
      return;
    }

    setGenerating(true);
    setResult(null);
    clearMessages();
    connect();

    try {
      const res = await generateCampaign(campaignName.trim(), sourceText.trim());
      setResult(res.output);
      toast.success("Campaign generated successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      toast.error(message);
    } finally {
      setGenerating(false);
      disconnect();
    }
  };

  const drafts = result?.drafts as
    | { blog_post: string; social_thread: string[]; email_teaser: string }
    | undefined;

  const factSheet = result?.fact_sheet as
    | {
        product_name?: string;
        value_proposition?: string;
        target_audience?: string;
        tone_and_positioning?: string;
        core_features?: string[];
        ambiguous_statements?: { statement: string; reason: string }[];
      }
    | undefined;

  const review = result?.review as ReviewSection | undefined;
  const status = result?.status as string | undefined;
  const iterations = result?.iterations as number | undefined;

  // Build a minimal Campaign-like object for PDF export
  const campaignForPdf: Campaign | null = result
    ? ({
        id: "",
        input_text: sourceText,
        campaign_name: campaignName || undefined,
        status: (status || "pending") as Campaign["status"],
        iterations: iterations ?? 0,
        created_at: new Date().toISOString(),
        output: result as Campaign["output"],
      } as Campaign)
    : null;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Create Campaign
          </h1>
          <p className="text-sm text-muted-foreground">
            Paste your product text and watch AI agents collaborate in real time
          </p>
        </div>
      </div>

      {/* Input + Agent Feed */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Left: Source input */}
        <div className="section-card p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1">
              Campaign Name
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              What product or project is this campaign for?
            </p>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. Acme Task Manager, Project Nova..."
              disabled={generating}
              className="w-full bg-background rounded-xl border border-border px-4 h-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1">
              Source Text
            </label>
            <p className="text-xs text-muted-foreground">
              Paste your product description, marketing brief, or raw text
            </p>
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="e.g. Our new AI-powered task manager helps remote teams collaborate effortlessly. With real-time sync, smart prioritisation…"
            rows={10}
            disabled={generating}
            className="w-full bg-background rounded-xl border border-border p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all disabled:opacity-50 leading-relaxed"
          />
          <Button
            onClick={handleGenerate}
            disabled={generating || !sourceText.trim() || !campaignName.trim()}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11 shadow-sm"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating campaign…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Campaign
              </>
            )}
          </Button>
        </div>

        {/* Right: Agent feed */}
        <div className="section-card overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-foreground">
                Agent Activity Feed
              </span>
              <p className="text-xs text-muted-foreground">
                Live multi-agent collaboration
              </p>
            </div>
            {generating && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-80 max-h-100">
            {messages.length === 0 && !generating && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <Bot className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No activity yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-50">
                  Agent conversations will appear here when you generate a
                  campaign
                </p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <ChatBubble key={i} message={msg} isGenerating={generating} />
              ))}
            </AnimatePresence>

            {/* Typing dots — only while generating AND before result arrives */}
            {generating && !result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-1 py-2"
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
                <span className="text-xs text-muted-foreground">
                  Agents working…
                </span>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Generating placeholder */}
      {generating && !result && (
        <div className="section-card p-10 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">
            AI agents are crafting your campaign
          </p>
          <p className="text-xs text-muted-foreground">
            This usually takes 30–90 seconds
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Result header */}
          <div className="section-card px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {campaignName || "Generated Campaign"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review your AI-generated content below
                </p>
              </div>
              <div className="flex items-center gap-3">
                {status && <StatusBadge status={status} size="md" />}
                {iterations !== undefined && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IterationCcw className="w-3.5 h-3.5" />
                    {iterations} iteration{iterations !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Fact Sheet */}
          {factSheet &&
            (factSheet.product_name ||
              factSheet.value_proposition ||
              factSheet.target_audience) && (
              <FactSheetCard data={factSheet} />
            )}

          {/* Blog Post */}
          {drafts?.blog_post && (
            <ContentSection
              title="Blog Post"
              subtitle="Long-form article ready to publish"
              icon={<FileText className="w-5 h-5" />}
              content={drafts.blog_post}
              accentClass="text-primary bg-primary/10"
            />
          )}

          {/* Social Thread */}
          {drafts?.social_thread && drafts.social_thread.length > 0 && (
            <SocialThreadCard
              posts={drafts.social_thread}
              campaignName={campaignName || undefined}
            />
          )}

          {/* Email */}
          {drafts?.email_teaser && (
            <EmailCard
              content={drafts.email_teaser}
              productName={campaignName || factSheet?.product_name}
            />
          )}

          {/* Review */}
          {review && <ReviewCard review={review} />}

          {/* Export */}
          <div className="section-card px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Export Campaign Kit
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download as an HTML report
                </p>
              </div>
              {campaignForPdf && (
                <Button
                  size="sm"
                  className="gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => void downloadCampaignAsPdf(campaignForPdf)}
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}