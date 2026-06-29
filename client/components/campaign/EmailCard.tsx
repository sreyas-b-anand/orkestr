"use client";

import { useState } from "react";
import {
  Copy,
  CheckCircle2,
  Mail,
  Users,
  User,
  AtSign,
  AlignLeft,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

interface EmailCardProps {
  content: string;
  productName?: string;
}

function EmailField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-1.5 w-20 shrink-0 mt-0.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <span className="text-sm text-foreground leading-relaxed">{value}</span>
    </div>
  );
}

export function EmailCard({ content, productName }: EmailCardProps) {
  const [copied, setCopied] = useState(false);

  const firstLine = content.split("\n").find((l) => l.trim().length > 10) ?? "";
  const subject = productName
    ? `Introducing ${productName} — See What's Possible`
    : firstLine.slice(0, 68) + (firstLine.length > 68 ? "…" : "");

  const fullEmailText = `From: Orkestr AI <campaigns@orkestr.ai>
To: Marketing Team <marketing@yourcompany.com>
CC: growth@yourcompany.com, ceo@yourcompany.com
Subject: ${subject}

${content}

--
Orkestr AI · AI-Powered Campaign Generator
Unsubscribe · Privacy Policy`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullEmailText);
    setCopied(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="section-card overflow-hidden">
      {/* Window chrome / header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Email Campaign
            </h2>
            <p className="text-xs text-muted-foreground">
              Ready-to-send campaign email
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary border border-border hover:border-primary/30 rounded-lg px-3 py-1.5 transition-all hover:bg-primary/5"
        >
          {copied ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "Copied" : "Copy Email"}
        </button>
      </div>

      {/* Email header fields */}
      <div className="px-6 pt-2 pb-1 border-b border-border bg-muted/10">
        <EmailField
          icon={<User className="w-3.5 h-3.5" />}
          label="From"
          value="Orkestr AI <campaigns@orkestr.ai>"
        />
        <EmailField
          icon={<AtSign className="w-3.5 h-3.5" />}
          label="To"
          value="Marketing Team <marketing@yourcompany.com>"
        />
        <EmailField
          icon={<Users className="w-3.5 h-3.5" />}
          label="CC"
          value="growth@yourcompany.com, ceo@yourcompany.com"
        />
        <EmailField
          icon={<AlignLeft className="w-3.5 h-3.5" />}
          label="Subject"
          value={subject}
        />
        <EmailField
          icon={<Paperclip className="w-3.5 h-3.5" />}
          label="Attach"
          value="campaign-brief.pdf (AI-generated)"
        />
      </div>

      {/* Email body */}
      <div className="px-8 py-6">
        <div className="max-w-2xl">
          <p className="text-sm text-foreground leading-[1.85] whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>

      {/* Email footer */}
      <div className="px-6 py-3 border-t border-border bg-muted/20">
        <p className="text-[11px] text-muted-foreground">
          You are receiving this because you subscribed to Orkestr campaign
          updates.{" "}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">
            Unsubscribe
          </span>{" "}
          ·{" "}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
