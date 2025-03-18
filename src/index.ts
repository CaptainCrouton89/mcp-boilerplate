#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { EmbeddingApiClient } from "./api.js";
// Create the MCP server
const server = new McpServer({
  name: "conversation-memory",
  version: "1.0.0",
});

// Create the API client
const apiClient = new EmbeddingApiClient();

// Tool: Store conversation with embeddings
server.tool(
  "save-memory",
  "Save content to vector database",
  {
    content: z.string().describe("The content to store"),
    path: z.string().describe("Unique identifier path for the content"),
    type: z.string().optional().describe("Content type (e.g., 'markdown')"),
    source: z.string().optional().describe("Source of the content"),
    parentPath: z
      .string()
      .optional()
      .describe("Path of the parent content (if applicable)"),
  },
  async ({ content, path, type, source, parentPath }) => {
    // Create a conversation ID from the path
    const conversationId = path.replace(/[^a-zA-Z0-9]/g, "_");

    // Parse content into messages if possible, otherwise create a single message
    let messages = [];
    try {
      // Try to parse as JSON first if it looks like it might be JSON
      if (content.trim().startsWith("[") || content.trim().startsWith("{")) {
        const parsedContent = JSON.parse(content);
        if (
          Array.isArray(parsedContent) &&
          parsedContent.every((msg) => msg.role && msg.content)
        ) {
          messages = parsedContent;
        } else {
          messages = [{ role: "assistant", content }];
        }
      } else {
        // Treat as a single message
        messages = [{ role: "assistant", content }];
      }
    } catch (e) {
      // If parsing fails, treat as a single message
      messages = [{ role: "assistant", content }];
    }

    const request = {
      conversationId,
      title: parentPath || path,
      messages,
      metadata: {
        source: source || "api",
        type: type || "markdown",
        originalPath: path,
      },
    };

    const response = await apiClient.storeConversation(request);

    if (!response.success) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error storing content: ${response.error || "Unknown error"}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Successfully stored content with conversation ID: ${
            response.conversationId
          }\nMessages processed: ${response.messages || 0}`,
        },
      ],
    };
  }
);

// Tool: Search conversations using vector similarity
server.tool(
  "search-memory",
  "Search for information in vector database",
  {
    query: z.string().describe("The search query"),
    maxMatches: z
      .number()
      .optional()
      .describe("Maximum number of matches to return"),
  },
  async ({ query, maxMatches }) => {
    const request = {
      query,
      matchCount: maxMatches,
      includeContext: true,
    };

    const response = await apiClient.searchConversations(request);

    if (!response.success) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error searching content: ${response.error}`,
          },
        ],
      };
    }

    if (!response.matches || response.matches.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No matching content found for your query.",
          },
        ],
      };
    }

    // Format the search results into a readable text
    const results = response.matches
      .map((match) => {
        let resultText = `--- Match (${(match.similarity * 100).toFixed(
          0
        )}% similarity) ---\n`;
        resultText += `${match.role}: ${match.content}\n`;

        // Add conversation details if available
        if ("conversation" in match) {
          const enrichedMatch = match as any;
          resultText += `\nFrom conversation: ${
            enrichedMatch.conversation.title ||
            enrichedMatch.conversation.conversation_id
          }\n`;

          // Add context if available
          if (enrichedMatch.context && enrichedMatch.context.length > 0) {
            resultText += "\nContext:\n";
            enrichedMatch.context.forEach((ctx: any) => {
              resultText += `${ctx.role}: ${ctx.content}\n`;
            });
          }
        }

        return resultText;
      })
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: results,
        },
      ],
    };
  }
);

// Add a prompt to help store new content
server.prompt(
  "save-memory",
  {
    path: z.string().describe("Unique identifier path for the content"),
    content: z.string().describe("The content to store"),
  },
  ({ path, content }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please help me store the following content with path "${path}":\n\n${content}\n\nYou can use the save-memory tool to save this information.`,
        },
      },
    ],
  })
);

// Add a prompt for searching content
server.prompt(
  "search-memory",
  {
    query: z.string().describe("The search query"),
  },
  ({ query }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please search for information about: ${query}\n\nYou can use the search-memory tool to find relevant information.`,
        },
      },
    ],
  })
);

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Conversation Memory Server running...");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch(console.error);
