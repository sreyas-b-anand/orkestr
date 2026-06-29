import { Campaign } from "@/types/campaign";

type FactSheet = {
  product_name?: string;
  value_proposition?: string;
  target_audience?: string;
  tone_and_positioning?: string;
  core_features?: string[];
  ambiguous_statements?: { statement: string; reason: string }[];
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderFactSheet(fs: FactSheet): string {
  const rows: string[] = [];
  if (fs.product_name)
    rows.push(`<tr><td class="label">Product</td><td>${escapeHtml(fs.product_name)}</td></tr>`);
  if (fs.value_proposition)
    rows.push(`<tr><td class="label">Value Proposition</td><td>${escapeHtml(fs.value_proposition)}</td></tr>`);
  if (fs.target_audience)
    rows.push(`<tr><td class="label">Target Audience</td><td>${escapeHtml(fs.target_audience)}</td></tr>`);
  if (fs.tone_and_positioning)
    rows.push(`<tr><td class="label">Tone</td><td>${escapeHtml(fs.tone_and_positioning)}</td></tr>`);
  if (fs.core_features?.length)
    rows.push(`<tr><td class="label">Core Features</td><td>${fs.core_features.map(f => `<span class="tag">${escapeHtml(f)}</span>`).join(" ")}</td></tr>`);
  return rows.length
    ? `<table class="fact-table">${rows.join("")}</table>`
    : "";
}

function renderSocialThread(posts: string[]): string {
  return posts
    .map(
      (p, i) =>
        `<div class="tweet"><div class="tweet-header"><span class="tweet-name">Orkestr</span><span class="tweet-handle">@orkestr_ai</span><span class="tweet-num">${i + 1}/${posts.length}</span></div><p>${escapeHtml(p)}</p></div>`
    )
    .join("");
}

function renderReview(review: Campaign["output"]["review"]): string {
  if (!review) return "";
  const pieces = [
    ["blog_post", "Blog Post"],
    ["social_thread", "Social Thread"],
    ["email_teaser", "Email Teaser"],
  ] as const;

  return pieces
    .map(([key, label]) => {
      const r = (review as Record<string, { approved: boolean; correction_note?: string; issues?: string[] }>)[key];
      if (!r) return "";
      const icon = r.approved ? "✓" : "✗";
      const status = r.approved ? "Approved" : "Revised";
      const color = r.approved ? "#15803d" : "#b45309";
      return `<div class="review-item"><span style="color:${color};font-weight:700">${icon} ${label}</span> — <span style="color:${color}">${status}</span>${r.correction_note ? `<p class="review-note">${escapeHtml(r.correction_note)}</p>` : ""}</div>`;
    })
    .join("");
}

export function downloadCampaignAsPdf(campaign: Campaign): void {
  const factSheet = campaign.output?.fact_sheet as FactSheet | undefined;
  const drafts = campaign.output?.drafts;
  const review = campaign.output?.review;
  const date = campaign.created_at
    ? new Date(campaign.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const statusColor =
    campaign.status === "approved"
      ? "#15803d"
      : campaign.status === "rejected"
        ? "#b91c1c"
        : "#92400e";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Campaign Report — Orkestr</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif;
      color: #111827;
      background: #fff;
      font-size: 13px;
      line-height: 1.6;
      padding: 0;
    }
    .page { max-width: 780px; margin: 0 auto; padding: 48px 40px; }
    /* Header */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand { font-size: 22px; font-weight: 800; color: #4338ca; letter-spacing: -0.5px; }
    .brand-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .meta { text-align: right; font-size: 11px; color: #6b7280; }
    .status-pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${statusColor};
      border: 1.5px solid ${statusColor};
      margin-bottom: 6px;
    }
    /* Section */
    .section { margin-bottom: 32px; }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }
    .section-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4338ca;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
    }
    /* Source text */
    .source-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px 16px;
      white-space: pre-wrap;
      font-size: 12.5px;
      color: #374151;
    }
    /* Fact sheet */
    .fact-table { width: 100%; border-collapse: collapse; }
    .fact-table tr { border-bottom: 1px solid #f3f4f6; }
    .fact-table tr:last-child { border-bottom: none; }
    .fact-table td { padding: 8px 6px; vertical-align: top; font-size: 12.5px; }
    .fact-table td.label {
      width: 160px;
      font-weight: 600;
      color: #6b7280;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding-right: 16px;
    }
    .tag {
      display: inline-block;
      background: #eef2ff;
      color: #4338ca;
      border: 1px solid #c7d2fe;
      border-radius: 999px;
      padding: 1px 8px;
      font-size: 11px;
      font-weight: 500;
      margin: 2px 2px;
    }
    /* Content */
    .content-box { white-space: pre-wrap; font-size: 13px; line-height: 1.75; color: #1f2937; }
    /* Tweet */
    .tweet {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 10px;
    }
    .tweet-header { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
    .tweet-name { font-weight: 700; font-size: 13px; }
    .tweet-handle { color: #6b7280; font-size: 12px; }
    .tweet-num { margin-left: auto; background: #f3f4f6; border-radius: 999px; padding: 1px 8px; font-size: 11px; color: #6b7280; }
    /* Email */
    .email-card { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
    .email-header { background: #f9fafb; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
    .email-field { display: flex; gap: 12px; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
    .email-field:last-child { border-bottom: none; }
    .email-label { width: 64px; font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; padding-top: 1px; }
    .email-body { padding: 16px; white-space: pre-wrap; font-size: 13px; line-height: 1.75; color: #1f2937; }
    .email-footer { background: #f9fafb; padding: 8px 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
    /* Review */
    .review-item { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .review-item:last-child { border-bottom: none; }
    .review-note { color: #6b7280; font-size: 12px; margin-top: 4px; }
    /* Footer */
    .doc-footer { border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 14px; text-align: center; font-size: 11px; color: #9ca3af; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 32px 36px; }
    }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand">Orkestr</div>
      <div class="brand-sub">AI Campaign Report</div>
    </div>
    <div class="meta">
      <div class="status-pill">${escapeHtml(campaign.status || "pending")}</div>
      <div>${campaign.iterations} iteration${campaign.iterations !== 1 ? "s" : ""}</div>
      <div>${escapeHtml(date)}</div>
    </div>
  </div>

  <!-- 1. Source Text -->
  <div class="section">
    <div class="section-title"><span class="section-num">1</span> Source Text</div>
    <div class="source-box">${escapeHtml(campaign.input_text || "")}</div>
  </div>

  ${
    factSheet
      ? `<!-- 2. Fact Sheet -->
  <div class="section">
    <div class="section-title"><span class="section-num">2</span> AI Fact Sheet</div>
    ${renderFactSheet(factSheet)}
  </div>`
      : ""
  }

  ${
    drafts?.blog_post
      ? `<!-- 3. Blog Post -->
  <div class="section">
    <div class="section-title"><span class="section-num">3</span> Blog Post</div>
    <div class="content-box">${escapeHtml(drafts.blog_post)}</div>
  </div>`
      : ""
  }

  ${
    drafts?.social_thread?.length
      ? `<!-- 4. Social Thread -->
  <div class="section">
    <div class="section-title"><span class="section-num">4</span> Social Media Thread</div>
    ${renderSocialThread(drafts.social_thread)}
  </div>`
      : ""
  }

  ${
    drafts?.email_teaser
      ? `<!-- 5. Email -->
  <div class="section">
    <div class="section-title"><span class="section-num">5</span> Email Campaign</div>
    <div class="email-card">
      <div class="email-header">
        <div class="email-field"><span class="email-label">From</span><span>Orkestr AI &lt;campaigns@orkestr.ai&gt;</span></div>
        <div class="email-field"><span class="email-label">To</span><span>Marketing Team &lt;marketing@yourcompany.com&gt;</span></div>
        <div class="email-field"><span class="email-label">CC</span><span>growth@yourcompany.com, ceo@yourcompany.com</span></div>
        <div class="email-field"><span class="email-label">Subject</span><span>${escapeHtml(factSheet?.product_name ? `Introducing ${factSheet.product_name} — See What's Possible` : drafts.email_teaser.split("\n")[0]?.slice(0, 68) ?? "Campaign Update")}</span></div>
      </div>
      <div class="email-body">${escapeHtml(drafts.email_teaser)}</div>
      <div class="email-footer">Orkestr AI · AI-Powered Campaign Generator</div>
    </div>
  </div>`
      : ""
  }

  ${
    review
      ? `<!-- 6. Editor Review -->
  <div class="section">
    <div class="section-title"><span class="section-num">6</span> Editor Review</div>
    ${renderReview(review)}
  </div>`
      : ""
  }

  <div class="doc-footer">
    Generated by Orkestr AI · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
  </div>
</div>
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 400);
  };
</script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=800");
  if (!w) {
    alert("Please allow pop-ups to download the PDF.");
    return;
  }
  w.document.write(html);
  w.document.close();
}
