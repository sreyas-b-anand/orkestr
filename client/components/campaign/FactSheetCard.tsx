import {
  Tag,
  Users,
  Mic2,
  Zap,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type FactSheetData = {
  product_name?: string;
  value_proposition?: string;
  target_audience?: string;
  tone_and_positioning?: string;
  core_features?: string[];
  ambiguous_statements?: { statement: string; reason: string }[];
};

interface FactSheetCardProps {
  data: FactSheetData;
}

function FactField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          {label}
        </p>
        <p className="text-sm text-foreground leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

export function FactSheetCard({ data }: FactSheetCardProps) {
  return (
    <div className="section-card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Fact Sheet
          </h2>
          <p className="text-xs text-muted-foreground">
            Extracted product intelligence
          </p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {data.product_name && (
          <FactField
            icon={<Tag className="w-4 h-4" />}
            label="Product Name"
            value={data.product_name}
          />
        )}
        {data.value_proposition && (
          <FactField
            icon={<Zap className="w-4 h-4" />}
            label="Value Proposition"
            value={data.value_proposition}
          />
        )}
        {data.target_audience && (
          <FactField
            icon={<Users className="w-4 h-4" />}
            label="Target Audience"
            value={data.target_audience}
          />
        )}
        {data.tone_and_positioning && (
          <FactField
            icon={<Mic2 className="w-4 h-4" />}
            label="Tone & Positioning"
            value={data.tone_and_positioning}
          />
        )}
      </div>

      {data.core_features && data.core_features.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Core Features
          </p>
          <div className="flex flex-wrap gap-2">
            {data.core_features.map((f, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs font-medium border-primary/25 text-primary bg-primary/5 px-3 py-1 rounded-full"
              >
                {f}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {data.ambiguous_statements && data.ambiguous_statements.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Ambiguous Statements
          </p>
          <div className="space-y-2">
            {data.ambiguous_statements.map((a, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/15"
              >
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-0.5">
                  &ldquo;{a.statement}&rdquo;
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/70">
                  {a.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
