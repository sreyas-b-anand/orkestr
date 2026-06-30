import { Campaign } from "@/types/campaign";

type FactSheet = {
  product_name?: string;
  value_proposition?: string;
  target_audience?: string;
  tone_and_positioning?: string;
  core_features?: string[];
};


export async function downloadCampaignAsPdf(campaign: Campaign): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth(); 
  const pageH = doc.internal.pageSize.getHeight();
  const ml = 18;
  const mr = 18; 
  const contentW = pageW - ml - mr;

  let y = ml;

  const campaignName = campaign.campaign_name || "Campaign Report";
  const safeName = campaignName
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .trim()
    .replace(/\s+/g, "-");

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

  const C = {
    primary: [67, 56, 202] as [number, number, number],   // indigo-700
    text: [17, 24, 39] as [number, number, number],        // gray-900
    muted: [107, 114, 128] as [number, number, number],    // gray-500
    border: [229, 231, 235] as [number, number, number],   // gray-200
    bg: [249, 250, 251] as [number, number, number],       // gray-50
    approved: [21, 128, 61] as [number, number, number],   // green-700
    rejected: [185, 28, 28] as [number, number, number],   // red-700
    pending: [146, 64, 14] as [number, number, number],    // amber-800
  };

  const ensure = (needed: number) => {
    if (y + needed > pageH - ml) {
      doc.addPage();
      y = ml;
    }
  };

  const rule = (extra = 0) => {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(ml, y + extra, pageW - mr, y + extra);
  };

  const sectionHeading = (num: number, label: string) => {
    ensure(14);
    // Number pill
    doc.setFillColor(...C.primary);
    doc.roundedRect(ml, y, 5.5, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(String(num), ml + 1.3, y + 3.8);
   
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.muted);
    doc.text(label.toUpperCase(), ml + 8, y + 4);
    y += 7;
    rule();
    y += 5;
    doc.setTextColor(...C.text);
    doc.setFont("helvetica", "normal");
  };

  const bodyText = (text: string, fontSize = 10, lineH = 5.2) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.text);
    const lines = doc.splitTextToSize(text, contentW);
    for (const line of lines) {
      ensure(lineH + 2);
      doc.text(line, ml, y);
      y += lineH;
    }
    y += 2;
  };

  /** Key-value row (for fact sheet / email headers) */
  const kvRow = (key: string, value: string) => {
    ensure(8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.muted);
    doc.text(key.toUpperCase(), ml, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.text);
    const lines = doc.splitTextToSize(value, contentW - 32);
    doc.text(lines, ml + 32, y);
    y += Math.max(6, lines.length * 5);
    rule(1);
    y += 4;
  };

  /** Source text inside a shaded box */
  const sourceBox = (text: string) => {
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(text, contentW - 10);
    const boxH = lines.length * 5 + 8;
    ensure(boxH + 4);
    doc.setFillColor(...C.bg);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(ml, y, contentW, boxH, 2, 2, "FD");
    doc.setTextColor(...C.text);
    doc.text(lines, ml + 5, y + 6);
    y += boxH + 4;
  };

  /** Tweet box */
  const tweetBox = (text: string, idx: number, total: number, name: string, handle: string) => {
    doc.setFontSize(9.5);
    const bodyLines = doc.splitTextToSize(text, contentW - 10);
    const boxH = bodyLines.length * 5 + 18;
    ensure(boxH + 4);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(ml, y, contentW, boxH, 2, 2, "FD");

    // Avatar circle
    doc.setFillColor(...C.primary);
    doc.circle(ml + 5, y + 7, 4, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text((name[0] ?? "O").toUpperCase(), ml + 3.4, y + 8.5);

    // Name + handle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    doc.text(name, ml + 12, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(`${handle}  ·  Just now`, ml + 12, y + 11);

    // Thread number
    if (total > 1) {
      doc.setFontSize(7.5);
      doc.text(`${idx + 1}/${total}`, pageW - mr - 10, y + 6);
    }

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.text);
    doc.text(bodyLines, ml + 5, y + 17);

    y += boxH + 3;
  };

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.primary);
  doc.text("Orkestr  ·  Campaign Report", ml, y);

  const statusColor =
    campaign.status === "approved"
      ? C.approved
      : campaign.status === "rejected"
        ? C.rejected
        : C.pending;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text(`${date}  ·  ${campaign.iterations} iteration${campaign.iterations !== 1 ? "s" : ""}`, pageW - mr, y, { align: "right" });

  y += 9;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.text);
  const nameLines = doc.splitTextToSize(campaignName, contentW - 30);
  doc.text(nameLines, ml, y);
  y += nameLines.length * 10;

  // Status pill
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...statusColor);
  const pillLabel = (campaign.status || "pending").toUpperCase();
  const pillW = doc.getTextWidth(pillLabel) + 6;
  doc.setDrawColor(...statusColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(ml, y, pillW, 5.5, 1.5, 1.5, "D");
  doc.text(pillLabel, ml + 3, y + 3.8);

  y += 10;
  rule();
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.text);

  if (campaign.input_text) {
    sectionHeading(1, "Source Text");
    sourceBox(campaign.input_text);
  }
  if (
    factSheet &&
    (factSheet.product_name ||
      factSheet.value_proposition ||
      factSheet.target_audience)
  ) {
    sectionHeading(2, "AI Fact Sheet");
    if (factSheet.product_name) kvRow("Product", factSheet.product_name);
    if (factSheet.value_proposition) kvRow("Value Proposition", factSheet.value_proposition);
    if (factSheet.target_audience) kvRow("Target Audience", factSheet.target_audience);
    if (factSheet.tone_and_positioning) kvRow("Tone", factSheet.tone_and_positioning);
    if (factSheet.core_features?.length) {
      kvRow("Core Features", factSheet.core_features.join("  ·  "));
    }
  }

  if (drafts?.blog_post) {
    sectionHeading(3, "Blog Post");
    bodyText(drafts.blog_post, 9.5, 5.2);
  }
  if (drafts?.social_thread?.length) {
    sectionHeading(4, "Social Media Thread");
    const handle =
      "@" +
      campaignName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 15) || "orkestr_ai";
    for (let i = 0; i < drafts.social_thread.length; i++) {
      tweetBox(
        drafts.social_thread[i],
        i,
        drafts.social_thread.length,
        campaignName,
        handle,
      );
    }
    y += 2;
  }
  if (drafts?.email_teaser) {
    sectionHeading(5, "Email Campaign");
    const emailName = campaignName;
    const emailHandle = emailName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const subject = `Introducing ${emailName} — See What's Possible`;
    kvRow("From", `${emailName} <hello@${emailHandle}.ai>`);
    kvRow("To", "Marketing Team <marketing@yourcompany.com>");
    kvRow("CC", "growth@yourcompany.com, ceo@yourcompany.com");
    kvRow("Subject", subject);
    y += 2;
    bodyText(drafts.email_teaser, 9.5, 5.2);

    // Signature
    ensure(12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...C.muted);
    doc.text(`— The ${emailName} Team  ·  hello@${emailHandle}.ai`, ml, y);
    y += 8;
    doc.setFont("helvetica", "normal");
  }

  if (review) {
    sectionHeading(6, "Editor Review");
    const pieces = [
      ["blog_post", "Blog Post"],
      ["social_thread", "Social Thread"],
      ["email_teaser", "Email Teaser"],
    ] as const;
    for (const [key, label] of pieces) {
      const r = (
        review as Record<
          string,
          { approved: boolean; correction_note?: string }
        >
      )[key];
      if (!r) continue;
      ensure(12);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...(r.approved ? C.approved : C.rejected));
      doc.text(`${r.approved ? "✓" : "✗"}  ${label} — ${r.approved ? "Approved" : "Revised"}`, ml, y);
      y += 5.5;
      if (r.correction_note) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...C.muted);
        const noteLines = doc.splitTextToSize(r.correction_note, contentW - 8);
        for (const line of noteLines) {
          ensure(5);
          doc.text(line, ml + 6, y);
          y += 4.5;
        }
      }
      y += 3;
    }
  }

  ensure(12);
  y += 4;
  rule();
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text(
    `${campaignName}  ·  Generated by Orkestr AI  ·  ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    pageW / 2,
    y,
    { align: "center" },
  );

  doc.save(`${safeName.toLowerCase()}-report.pdf`);
}
