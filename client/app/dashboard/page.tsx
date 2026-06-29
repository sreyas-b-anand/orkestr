"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getCampaigns, deleteCampaign } from "@/lib/api";
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
import { PlusCircle, LayoutGrid, AlertTriangle } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { CampaignCard } from "@/components/campaign/CampaignCard";

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
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load campaigns"
        );
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

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Campaigns
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your AI-generated marketing campaigns
            </p>
          </div>
        </div>
        <Link href="/dashboard/create">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium">
            <PlusCircle className="w-4 h-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="section-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
              </div>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && campaigns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
            <AlertTriangle className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No campaigns yet
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
            Create your first AI-powered marketing campaign and watch agents
            collaborate in real time.
          </p>
          <Link href="/dashboard/create">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              <PlusCircle className="w-4 h-4" />
              Create your first campaign
            </Button>
          </Link>
        </div>
      )}

      {/* Campaign grid */}
      {!loading && campaigns.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {campaigns.map((campaign, i) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                index={i}
                onDelete={setDeleteTarget}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="section-card border-border">
          <DialogHeader>
            <DialogTitle>Delete this campaign?</DialogTitle>
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
              {deleting ? "Deleting…" : "Delete Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
