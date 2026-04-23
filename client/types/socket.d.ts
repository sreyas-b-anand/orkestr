
export type WSMessage = {
  event: string;
  status: string;
  message?: string;
  data?: Record<string, unknown>;
  approved?: boolean;
};