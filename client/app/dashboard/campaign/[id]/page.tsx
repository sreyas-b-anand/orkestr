"use client";

import { useEffect, useState, use } from "react";
import { FactRow } from "@/components/FactRow";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getCampaign } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Copy,
  Download,
  CheckCircle2,
  FileText,
  MessageSquare,
  Mail,
  IterationCcw,
  Calendar,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

type CampaignData = {
  id: string;
  input_text: string;
  output: {
    fact_sheet: Record<string, unknown>;
    drafts: {
      blog_post: string;
      social_thread: string[];
      email_teaser: string;
    };
    review: Record<string, unknown>;
    status: string;
    iterations: number;
  };
  status: string;
  iterations: number;
  created_at: string;
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCampaign(id);
        if (res.status && res.campaign) {
          setCampaign(res.campaign as CampaignData);
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

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!campaign) return;
    const exportData = {
      campaign_id: campaign.id,
      input: campaign.input_text,
      ...campaign.output,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${campaign.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded campaign kit");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  const drafts = campaign.output?.drafts;
  const review = campaign.output?.review;

  // Cast to typed object for rendering
  const factSheet = campaign.output?.fact_sheet as {
    product_name?: string;
    value_proposition?: string;
    target_audience?: string;
    tone_and_positioning?: string;
    core_features?: string[];
    ambiguous_statements?: { statement: string; reason: string }[];
  } | undefined;

  const statusColor =
    campaign.status === "approved"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
      : "bg-amber-500/15 text-amber-400 border-amber-500/25";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back + Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="gap-1.5 text-muted-foreground hover:text-foreground mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to campaigns
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Campaign Details
          </h1>
          <Badge
            variant="outline"
            className={`${statusColor} text-xs font-semibold uppercase tracking-wider`}
          >
            {campaign.status || "pending"}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <IterationCcw className="w-3 h-3" />
            {campaign.iterations} iterations
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(campaign.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Source + Fact Sheet */}
        <div className="space-y-4">
          {/* Source text */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Source Text
            </h3>
            <ScrollArea className="h-[200px]">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {campaign.input_text}
              </p>
            </ScrollArea>
          </div>

          {/* Fact Sheet */}
          {factSheet && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Fact Sheet
              </h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {factSheet.product_name && (
                    <FactRow
                      label="Product"
                      value={factSheet.product_name}
                    />
                  )}
                  {factSheet.value_proposition && (
                    <FactRow
                      label="Value Proposition"
                      value={factSheet.value_proposition}
                    />
                  )}
                  {factSheet.target_audience && (
                    <FactRow
                      label="Target Audience"
                      value={factSheet.target_audience}
                    />
                  )}
                  {factSheet.tone_and_positioning && (
                    <FactRow
                      label="Tone"
                      value={factSheet.tone_and_positioning}
                    />
                  )}
                  {factSheet.core_features && factSheet.core_features.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Core Features
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {factSheet.core_features.map((f, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px] border-primary/20 text-primary"
                            >
                              {f}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {factSheet.ambiguous_statements && factSheet.ambiguous_statements.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Ambiguous Statements
                      </p>
                      {factSheet.ambiguous_statements.map((a, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs mb-1.5"
                        >
                          <p className="text-amber-300">&quot;{a.statement}&quot;</p>
                          <p className="text-muted-foreground mt-0.5">
                            {a.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Right: Outputs */}
        <div className="space-y-4">
          {drafts && (
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
                  <ScrollArea className="h-[400px]">
                    <div className="p-5">
                      <div className="flex justify-end mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] text-muted-foreground hover:text-primary"
                          onClick={() =>
                            handleCopy(drafts.blog_post)
                          }
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {drafts.blog_post}
                      </p>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="social" className="mt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-5 space-y-3">
                      {drafts.social_thread?.map(
                        (post: string, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-muted/30 border border-border group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] text-muted-foreground font-medium">
                                Post {i + 1}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleCopy(post)}
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </Button>
                            </div>
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
                  <ScrollArea className="h-[400px]">
                    <div className="p-5">
                      <div className="flex justify-end mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] text-muted-foreground hover:text-primary"
                          onClick={() =>
                            handleCopy(drafts.email_teaser)
                          }
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {drafts.email_teaser}
                      </p>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Editor Review Summary */}
          {review && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Editor Review
              </h3>
              <div className="space-y-2">
                {["blog_post", "social_thread", "email_teaser"].map(
                  (piece) => {
                    const r = (review as Record<string, Record<string, unknown>>)[
                      piece
                    ];
                    if (!r) return null;
                    return (
                      <div
                        key={piece}
                        className="flex items-center gap-2 text-xs"
                      >
                        {r.approved ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span className="text-foreground capitalize">
                          {piece.replace("_", " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {r.approved ? "Approved" : "Had revisions"}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Export */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs border-border hover:border-primary/30 hover:text-primary"
              onClick={() =>
                handleCopy(
                  JSON.stringify(
                    { input: campaign.input_text, ...campaign.output },
                    null,
                    2
                  )
                )
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
              Download Kit
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
