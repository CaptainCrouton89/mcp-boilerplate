import axios from "axios";

const API_BASE_URL = "https://ai-embeddings.vercel.app";

// Conversation message interface
export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, any>;
}

// Conversation data for storage
export interface ConversationData {
  conversationId: string;
  title?: string;
  summary?: string;
  messages: ConversationMessage[];
  metadata?: Record<string, any>;
}

// Store conversation response
export interface StoreResponse {
  success: boolean;
  conversationId: string;
  messages: number;
  error?: string;
}

// Search parameters
export interface SearchParams {
  query: string;
  conversationId?: string;
  matchCount?: number;
  matchThreshold?: number;
  includeContext?: boolean;
}

// Message match interface
export interface MessageMatch {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  created_at: string;
  similarity: number;
}

// Enhanced match with context
export interface EnrichedMatch extends MessageMatch {
  conversation: {
    conversation_id: string;
    title: string | null;
    created_at: string;
  };
  context: {
    id: number;
    role: string;
    content: string;
    created_at: string;
  }[];
}

// Search response
export interface SearchResponse {
  success: boolean;
  matches: MessageMatch[] | EnrichedMatch[];
  error?: string;
}

export class EmbeddingApiClient {
  async storeConversation(request: ConversationData): Promise<StoreResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/store-conversation-embedding`,
        request
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          conversationId: request.conversationId,
          messages: 0,
          error: error.response.data.error || "Failed to store conversation",
        };
      }
      return {
        success: false,
        conversationId: request.conversationId,
        messages: 0,
        error: "Failed to connect to conversation embedding service",
      };
    }
  }

  async searchConversations(request: SearchParams): Promise<SearchResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/search-conversation-embeddings`,
        request
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          matches: [],
          error: error.response.data.error || "Failed to search conversations",
        };
      }
      return {
        success: false,
        matches: [],
        error: "Failed to connect to conversation embedding service",
      };
    }
  }
}
