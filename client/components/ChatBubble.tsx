import { type WSMessage } from "@/types/socket";
import {
  XCircle,
  Search,
  PenLine,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Bot,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import React from "react";

const AGENT_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  fact_stage: {
    label: "Fact-Checker",
    icon: <Search className="w-3.5 h-3.5" />,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  writer_stage: {
    label: "Copywriter",
    icon: <PenLine className="w-3.5 h-3.5" />,
    color: "text-violet-600 dark:text-violet-400",
  },
  editor_stage: {
    label: "Editor-in-Chief",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    color: "text-amber-600 dark:text-amber-400",
  },
  revise_stage: {
    label: "Reviser",
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    color: "text-emerald-600 dark:text-emerald-400",
  },
};

export function ChatBubble({
  message,
  isGenerating,
}: {
  message: WSMessage;
  isGenerating?: boolean;
}) {
  const meta = AGENT_META[message.event] || {
    label: message.event,
    icon: <Bot className="w-3.5 h-3.5" />,
    color: "text-muted-foreground",
  };

  const isStart = message.status === "start";
  const isDone = message.status === "done";
  const isError = message.status === "error";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5"
    >
      {/* Icon */}
      <div
        className={`w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 ${meta.color}`}
      >
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className={`text-[11px] font-semibold ${meta.color}`}>
            {meta.label}
          </span>
          {/* {isStart && isGenerating && (
            <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
          )} */}

          {isDone && (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          )}

          {isError && (
            <XCircle className="w-3 h-3 text-destructive" />
          )}

          {message.approved !== undefined && (
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 font-semibold ${
                message.approved
                  ? "bg-[var(--status-approved-bg)] text-[var(--status-approved-text)] border-[var(--status-approved-border)]"
                  : "bg-[var(--status-rejected-bg)] text-[var(--status-rejected-text)] border-[var(--status-rejected-border)]"
              }`}
            >
              {message.approved ? "Approved" : "Rejected"}
            </Badge>
          )}
        </div>

        {/* Message text */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {message.message || (isDone ? "Completed" : "Processing…")}
        </p>
      </div>
    </motion.div>
  );
}