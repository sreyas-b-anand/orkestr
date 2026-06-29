"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  content: string;
  accentClass?: string;
  className?: string;
}

export function ContentSection({
  title,
  subtitle,
  icon,
  content,
  accentClass = "text-primary bg-primary/10",
  className,
}: ContentSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("section-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
              accentClass
            )}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
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
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        <p className="content-prose">{content}</p>
      </div>
    </div>
  );
}
