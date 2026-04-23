"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getCampaigns, deleteCampaign } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Trash2,
  Eye,
  Calendar,
  IterationCcw,
  Sparkles,
  FileText,
} from "lucide-react";
import { Campaign } from "@/types/campaign";

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCampaigns();
      setCampaigns(res.campaigns.campaigns || []);
    } catch (err ) {
      toast.error(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCampaign(deleteTarget);
      setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget));
      toast.success("Campaign deleted");
    } catch {
      toast.error("Failed to delete campaign");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
      case "rejected":
        return "bg-amber-500/15 text-amber-400 border-amber-500/25";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your AI-generated marketing campaigns
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary gap-2">
            <PlusCircle className="w-4 h-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && campaigns.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            No campaigns yet
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Create your first AI-powered marketing campaign and watch agents
            collaborate in real time.
          </p>
          <Link href="/dashboard/create">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary gap-2">
              <PlusCircle className="w-4 h-4" />
              Create your first campaign
            </Button>
          </Link>
        </motion.div>
      )}

     
      {!loading && campaigns.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {campaigns.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="glass-card rounded-2xl p-5 flex flex-col group hover:border-primary/20 transition-colors duration-300"
              >
                {/* Input preview */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
                    {campaign.input_text.slice(0, 150)}
                    {campaign.input_text.length > 150 ? "…" : ""}
                  </p>
                </div>

               
                <div className="flex flex-wrap items-center gap-2 mt-auto pt-3">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase tracking-wider ${statusColor(campaign.status)}`}
                  >
                    {campaign.status || "pending"}
                  </Badge>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <IterationCcw className="w-3 h-3" />
                    {campaign.iterations} iterations
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {campaign.created_at?.split("T")[0] || "N/A"}
                  </span>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  <Link href={`/dashboard/campaign/${campaign.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs border-border hover:border-primary/30 hover:text-primary hover:cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(campaign.id)}
                    className="gap-1.5 text-xs border-border hover:border-destructive/30 hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle>Delete campaign?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The campaign and all generated
              content will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
