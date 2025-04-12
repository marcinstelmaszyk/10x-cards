import type { JSONSchema4 } from "json-schema";

// OpenRouter API response and request types
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export type RequestPayload = {
  model: string;
  messages: ChatMessage[];
  response_format?: {
    type: "json_schema";
    json_schema: {
      name: string;
      strict: boolean;
      schema: JSONSchema4;
    };
  };
} & ModelParameters;

export interface ApiResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
}

export interface OpenRouterServiceConfig {
  apiKey: string;
  apiUrl?: string;
  timeout?: number;
  retries?: number;
  defaultModel?: string;
  defaultParams?: ModelParameters;
}

export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: JSONSchema4;
  };
}
