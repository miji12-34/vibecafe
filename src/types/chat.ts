export interface Recommendation {
  id: string;
  reason: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  recommendations?: Recommendation[];
}

export interface ChatResponse {
  reply: string;
  recommendations: Recommendation[];
}
