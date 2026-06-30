"use client";

import { useState } from "react";
import {
  Copy,
  CheckCircle2,
  Mail,
  Users,
  User,
  AlignLeft,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface EmailCardProps {
  content: string;
  /** Campaign / product name — used throughout the email */
  productName?: string;
}

function EmailField({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-1.5 w-20 shrink-0 mt-0.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <span
        className={`text-sm leading-relaxed ${
          highlight ? "font-semibold text-foreground" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function EmailCard({ content, productName }: EmailCardProps) {
  const [copied, setCopied] = useState(false);

  const name = productName?.trim() || "Orkestr";

  // Sender identity uses campaign name
  const fromAddress = `${name} <hello@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.ai>`;

  // Subject derived from campaign name or first line
  const firstLine = content.split("\n").find((l) => l.trim().length > 10) ?? "";
  const subject = `Introducing ${name} — See What's Possible`;

  // Signature block
  const signature = `\n\n—\nThe ${name} Team\nhello@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.ai`;

  const fullEmailText = `From: ${fromAddress}
To: Marketing Team <marketing@yourcompany.com>
CC: growth@yourcompany.com, ceo@yourcompany.com
Subject: ${subject}

${content}${signature}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullEmailText);
    setCopied(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="section-card overflow-hidden">
      {/* Header / toolbar */}
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
              Ready-to-send email for{" "}
              <span className="font-medium text-foreground">{name}</span>
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

      {/* Metadata fields */}
      <div className="px-6 py-1 border-b border-border bg-muted/5">
        <EmailField
          icon={<Building2 className="w-3.5 h-3.5" />}
          label="From"
          value={fromAddress}
          highlight
        />
        <EmailField
          icon={<User className="w-3.5 h-3.5" />}
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
          highlight
        />
      </div>

      {/* Email body */}
      <div className="px-8 py-6">
        <div className="max-w-2xl">
          <p className="text-sm text-foreground leading-[1.9] whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>

      {/* Signature */}
      <div className="px-8 pb-5">
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="block text-foreground font-medium">
              The {name} Team
            </span>
            <span className="text-xs">
              hello@
              {name.toLowerCase().replace(/[^a-z0-9]/g, "")}.ai
            </span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border bg-muted/20">
        <p className="text-[11px] text-muted-foreground">
          You are receiving this because you subscribed to {name} updates.{" "}
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
