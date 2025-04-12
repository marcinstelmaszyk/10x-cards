import type { JSONSchema4 } from "json-schema";
import type {
  ApiResponse,
  ChatMessage,
  ModelParameters,
  OpenRouterServiceConfig,
  RequestPayload,
  ResponseFormat,
} from "./openrouter.types";

/**
 * OpenRouter Service for LLM API integration
 * Enables communication with OpenRouter API to generate responses
 * based on system and user messages with structured JSON output support.
 */
export class OpenRouterService {
  private apiKey: string;
  private apiUrl: string;
  private timeout: number;
  private retries: number;
  private defaultModel: string;
  private defaultParams: ModelParameters;

  private currentSystemMessage = "";
  private currentUserMessage = "";
  private currentModelName: string;
  private currentModelParameters: ModelParameters;
  private currentResponseFormat?: ResponseFormat;

  /**
   * Creates a new OpenRouter service instance
   * @param config Configuration for the OpenRouter service
   */
  constructor(config: OpenRouterServiceConfig) {
    // Initialize API configuration
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || "https://openrouter.ai/api/v1/chat/completions";
    this.timeout = config.timeout || 30000; // Default 30s timeout
    this.retries = config.retries || 3; // Default 3 retries

    // Initialize model defaults
    this.defaultModel = config.defaultModel || "mistralai/mistral-7b-instruct:free";
    this.defaultParams = config.defaultParams || {
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    // Set current model and parameters to default values
    this.currentModelName = this.defaultModel;
    this.currentModelParameters = { ...this.defaultParams };
  }

  /**
   * Sets the system message to be included in API requests
   * @param message The system message content
   */
  public setSystemMessage(message: string): void {
    this.currentSystemMessage = message;
  }

  /**
   * Sets the user message to be included in API requests
   * @param message The user message content
   */
  public setUserMessage(message: string): void {
    this.currentUserMessage = message;
  }

  /**
   * Configures the JSON schema for structured responses
   * @param schema The JSON schema for the response format
   * @param name Name of the schema (for identification)
   * @param strict Whether to enforce strict schema validation
   * @deprecated Use the new overload method with config object instead
   */
  public setResponseFormat(
    schemaOrConfig: JSONSchema4 | { name: string; schema: JSONSchema4; strict?: boolean },
    name = "response",
    strict = true
  ): void {
    if (typeof schemaOrConfig === "object" && "name" in schemaOrConfig && "schema" in schemaOrConfig) {
      // Handle the new config object format
      const config = schemaOrConfig;
      this.currentResponseFormat = {
        type: "json_schema",
        json_schema: {
          name: config.name,
          strict: config.strict !== undefined ? config.strict : true,
          schema: config.schema,
        },
      };
    } else {
      // Handle the old format with separate parameters
      const schema = schemaOrConfig as JSONSchema4;
      this.currentResponseFormat = {
        type: "json_schema",
        json_schema: {
          name,
          strict,
          schema,
        },
      };
    }
  }

  /**
   * Configures the JSON schema for structured responses with a config object
   * @param config Configuration object containing name and schema
   * @deprecated Use the unified setResponseFormat method instead
   */
  public setResponseFormatWithConfig(config: { name: string; schema: JSONSchema4; strict?: boolean }): void {
    this.setResponseFormat(config);
  }

  /**
   * Sets the model and parameters for API requests
   * @param name The model name/identifier
   * @param parameters Optional model parameters to override defaults
   */
  public setModel(name: string, parameters?: ModelParameters): void {
    this.currentModelName = name;
    this.currentModelParameters = { ...this.defaultParams, ...parameters };
  }

  /**
   * Sends a chat message to the OpenRouter API
   * @param userMessage Optional user message (if not provided, uses the currently set message)
   * @returns Promise resolving to the API response
   */
  public async sendChatMessage<T = unknown>(userMessage?: string): Promise<T> {
    // If userMessage is provided, update the current user message
    if (userMessage) {
      this.setUserMessage(userMessage);
    }

    // Build the request payload
    const payload = this.buildRequestPayload();

    // Execute the API request
    const response = await this.executeRequest(payload);

    // Extract and return the response content
    try {
      // Extract the assistant's message content from the response
      const content = response.choices[0].message.content;

      // If the content is a JSON string, parse it
      if (this.currentResponseFormat && typeof content === "string") {
        return JSON.parse(content) as T;
      }

      return content as unknown as T;
    } catch (error) {
      throw new Error(`Failed to parse response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Builds the request payload for the API call
   * @returns The formatted request payload
   * @private
   */
  private buildRequestPayload(): RequestPayload {
    // Start with the base messages array
    const messages: ChatMessage[] = [];

    // Add system message if available
    if (this.currentSystemMessage) {
      messages.push({
        role: "system",
        content: this.currentSystemMessage,
      });
    }

    // Add user message
    if (!this.currentUserMessage) {
      throw new Error("User message must be set before sending a chat message");
    }

    messages.push({
      role: "user",
      content: this.currentUserMessage,
    });

    // Build the complete payload
    const payload: RequestPayload = {
      model: this.currentModelName,
      messages,
      ...this.currentModelParameters,
    };

    // Add response format if specified
    if (this.currentResponseFormat) {
      payload.response_format = this.currentResponseFormat;
    }

    return payload;
  }

  /**
   * Executes the API request with retry logic
   * @param requestPayload The prepared request payload
   * @returns Promise resolving to the API response
   * @private
   */
  private async executeRequest(requestPayload: RequestPayload): Promise<ApiResponse> {
    let attempts = 0;
    let lastError: Error | undefined;

    while (attempts < this.retries) {
      try {
        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://api.openrouter.ai",
          },
          body: JSON.stringify(requestPayload),
          signal: AbortSignal.timeout(this.timeout),
        });

        // Handle non-success status codes
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));

          // Handle different error types
          if (response.status === 401 || response.status === 403) {
            throw new Error(`Authentication error: ${errorData.error || response.statusText}`);
          } else if (response.status === 429) {
            throw new Error(`Rate limit exceeded: ${errorData.error || response.statusText}`);
          } else {
            throw new Error(`API error (${response.status}): ${errorData.error || response.statusText}`);
          }
        }

        // Parse and return successful response
        return (await response.json()) as ApiResponse;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Only retry on network errors or 5xx server errors
        if (lastError.name === "AbortError" || lastError.message.includes("API error (5")) {
          attempts++;

          // Exponential backoff
          if (attempts < this.retries) {
            const backoffMs = Math.min(1000 * 2 ** attempts, 10000);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }
        } else {
          // Don't retry on client errors or parsing errors
          break;
        }
      }
    }

    // All retries failed or non-retryable error
    throw lastError || new Error("Request failed with unknown error");
  }
}

/**
 * Creates an instance of the OpenRouter service with configuration from environment variables
 * @param config Optional additional configuration to override defaults
 * @returns An initialized OpenRouter service instance
 */
export function createOpenRouterService(config: Partial<OpenRouterServiceConfig> = {}): OpenRouterService {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  return new OpenRouterService({
    apiKey,
    ...config,
  });
}
