"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getCampaign } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Campaign } from "@/types/campaign";
import { StatusBadge } from "@/components/ui/status-badge";
import { FactSheetCard } from "@/components/campaign/FactSheetCard";
import { ContentSection } from "@/components/campaign/ContentSection";
import { SocialThreadCard } from "@/components/campaign/SocialThreadCard";
import { EmailCard } from "@/components/campaign/EmailCard";
import { ReviewCard } from "@/components/campaign/ReviewCard";
import { downloadCampaignAsPdf } from "@/lib/export-pdf";
import {
  ArrowLeft,
  Copy,
  Download,
  CheckCircle2,
  FileText,
  Calendar,
  IterationCcw,
} from "lucide-react";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCampaign(id);
        if (res.status && res.campaign) {
          setCampaign(res.campaign as Campaign);
        } else {
          toast.error("Campaign not found");
          router.replace("/dashboard");
        }
      } catch {
        toast.error("Failed to load campaign");
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const handleCopyAll = async () => {
    if (!campaign) return;
    const exportData = {
      input: campaign.input_text,
      ...campaign.output,
    };
    await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-9 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!campaign) return null;

  const drafts = campaign.output?.drafts;
  const review = campaign.output?.review;

  const factSheet = campaign.output?.fact_sheet as
    | {
        product_name?: string;
        value_proposition?: string;
        target_audience?: string;
        tone_and_positioning?: string;
        core_features?: string[];
        ambiguous_statements?: { statement: string; reason: string }[];
      }
    | undefined;

  const hasFactSheet =
    factSheet &&
    (factSheet.product_name ||
      factSheet.value_proposition ||
      factSheet.target_audience ||
      factSheet.core_features?.length);

  const date = campaign.created_at
    ? new Date(campaign.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl space-y-6"
    >
      {/* ── Back ── */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard")}
        className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to campaigns
      </Button>

      {/* ── Campaign header ── */}
      <div className="section-card px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {campaign.campaign_name || "Campaign Report"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <IterationCcw className="w-3.5 h-3.5" />
                {campaign.iterations} iteration
                {campaign.iterations !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {date}
              </span>
            </div>
          </div>
          <StatusBadge status={campaign.status} size="lg" />
        </div>
      </div>

      {/* ── Row 1: Source + Fact Sheet (2-col) ── */}
      <div
        className={`grid gap-5 ${hasFactSheet ? "lg:grid-cols-2" : "grid-cols-1"}`}
      >
        {/* Source Text */}
        <div className="section-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/20">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Source Text
              </h2>
              <p className="text-xs text-muted-foreground">
                Original input provided
              </p>
            </div>
          </div>
          <div className="px-5 py-4 max-h-[280px] overflow-y-auto">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {campaign.input_text}
            </p>
          </div>
        </div>

        {/* Fact Sheet (only if present) */}
        {hasFactSheet && <FactSheetCard data={factSheet!} />}
      </div>

      {/* ── Blog Post ── */}
      {drafts?.blog_post && (
        <ContentSection
          title="Blog Post"
          subtitle="Long-form article ready to publish"
          icon={<FileText className="w-5 h-5" />}
          content={drafts.blog_post}
          accentClass="text-primary bg-primary/10"
        />
      )}

      {/* ── Social Thread ── */}
      {drafts?.social_thread && drafts.social_thread.length > 0 && (
        <SocialThreadCard
          posts={drafts.social_thread}
          campaignName={campaign.campaign_name}
        />
      )}

      {/* ── Email ── */}
      {drafts?.email_teaser && (
        <EmailCard
          content={drafts.email_teaser}
          productName={campaign.campaign_name || factSheet?.product_name}
        />
      )}

      {/* ── Editor Review ── */}
      {review && <ReviewCard review={review} />}

      {/* ── Export strip ── */}
      <div className="section-card px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Export Campaign Kit
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Download as an HTML report or copy the raw JSON
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-medium"
              onClick={handleCopyAll}
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy JSON"}
            </Button>
            <Button
              size="sm"
              className="gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => void downloadCampaignAsPdf(campaign)}
            >
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
