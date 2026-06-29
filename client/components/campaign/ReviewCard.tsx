import { CheckCircle2, XCircle, ShieldCheck, AlertCircle } from "lucide-react";
import { ReviewSection } from "@/types/campaign";

interface ReviewCardProps {
  review: ReviewSection;
}

const PIECE_LABELS: Record<string, { label: string }> = {
  blog_post: { label: "Blog Post" },
  social_thread: { label: "Social Thread" },
  email_teaser: { label: "Email Teaser" },
};

export function ReviewCard({ review }: ReviewCardProps) {
  const pieces = Object.entries(review) as [
    keyof ReviewSection,
    ReviewSection[keyof ReviewSection],
  ][];

  const allApproved = pieces.every(([, r]) => r?.approved);

  return (
    <div className="section-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            allApproved
              ? "bg-emerald-500/10"
              : "bg-amber-500/10"
          }`}
        >
          <ShieldCheck
            className={`w-5 h-5 ${
              allApproved
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Editor Review
          </h2>
          <p className="text-xs text-muted-foreground">
            {allApproved
              ? "All content pieces approved"
              : "Some pieces required revisions"}
          </p>
        </div>
      </div>

      {/* Review items */}
      <div className="divide-y divide-border">
        {pieces.map(([piece, r]) => {
          if (!r) return null;
          const meta = PIECE_LABELS[piece] ?? { label: piece };
          return (
            <div key={piece} className="px-6 py-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    r.approved
                      ? "bg-emerald-500/10"
                      : "bg-amber-500/10"
                  }`}
                >
                  {r.approved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {meta.label}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        r.approved
                          ? "bg-[var(--status-approved-bg)] text-[var(--status-approved-text)] border-[var(--status-approved-border)]"
                          : "bg-[var(--status-rejected-bg)] text-[var(--status-rejected-text)] border-[var(--status-rejected-border)]"
                      }`}
                    >
                      {r.approved ? "Approved" : "Revised"}
                    </span>
                  </div>

                  {r.correction_note && (
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                      {r.correction_note}
                    </p>
                  )}

                  {r.issues && r.issues.length > 0 && (
                    <div className="space-y-1">
                      {r.issues.map((issue, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1.5 text-xs text-muted-foreground"
                        >
                          <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
