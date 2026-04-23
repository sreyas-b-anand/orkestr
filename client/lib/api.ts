const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

import { Campaign, GetCampaignsResponse } from "@/types/campaign";
import { supabase } from "@/lib/supabase";

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  
  
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token){
    throw new Error("User is not authenticated");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    throw new Error(body.detail || `API error ${res.status}`);
  }

  return body;
}

export async function getCampaigns() {
  return apiFetch<GetCampaignsResponse>("/api/v1/campaigns");
}

export async function getCampaign(id: string) {
  return apiFetch<{
    campaign: Campaign;
    status: boolean;
  }>(`/api/v1/campaigns/${id}`);
}

export async function deleteCampaign(id: string) {
  return apiFetch<{ message: string }>(`/api/v1/campaigns/${id}`, {
    method: "DELETE",
  });
}

export async function generateCampaign(text: string) {
  return apiFetch<{
    input: string;
    output: Campaign["output"];
  }>("/api/v1/generate", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
