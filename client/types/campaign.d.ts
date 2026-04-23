type GetCampaignsResponse = {
  campaigns: {
    campaigns: Campaign[] | [];
    status: boolean | string;
    message: string;
  };
};

export type Drafts = {
  blog_post: string;
  social_thread: string[];
  email_teaser: string;
};

export type ReviewItem = {
  issues: string[];
  approved: boolean;
  correction_note: string;
};

export type ReviewSection = {
  blog_post: ReviewItem;
  email_teaser: ReviewItem;
  social_thread: ReviewItem;
};

export type Output = {
  source_text: string;
  fact_sheet: Record<string, unknown>;
  drafts: Drafts;
  review: ReviewSection;
  status: "approved" | "rejected" | "pending" | string;
  iterations: number;
  user_id?: string;
};

export type Campaign = {
  id: string;
  input_text: string;
  output: Output;
  status: "approved" | "rejected" | "pending";
  iterations: number;
  created_at: string | null;
};

export type { Campaign, GetCampaignsResponse, Output };