"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Campaign } from "@/types/campaign";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Trash2,
  Calendar,
  IterationCcw,
  FileText,
  ArrowRight,
} from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
  onDelete: (id: string) => void;
}

export function CampaignCard({ campaign, index, onDelete }: CampaignCardProps) {
  const date = campaign.created_at
    ? new Date(campaign.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const preview = campaign.input_text?.slice(0, 200) || "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="section-card flex flex-col group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Status strip at top */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
        <StatusBadge status={campaign.status} size="sm" />
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <IterationCcw className="w-3 h-3" />
            {campaign.iterations} iter.
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {date}
          </span>
        </div>
      </div>

      {/* Preview */}
      <div className="flex gap-3 px-5 py-4 flex-1">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
          <FileText className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">
          {preview}
          {campaign.input_text?.length > 200 ? "…" : ""}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-5 pb-4">
        <Link href={`/dashboard/campaign/${campaign.id}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs font-medium group-hover:border-primary/30 group-hover:text-primary transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View Campaign
            <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(campaign.id)}
          className="gap-1 text-xs text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
