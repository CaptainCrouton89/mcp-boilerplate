#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Create the MCP server
const server = new McpServer({
  name: "hello-world",
  version: "1.0.0",
});

// Tool: Store conversation with embeddings
server.tool(
  "hello-world",
  "Say hello to the user",
  {
    name: z.string().describe("The name of the user"),
  },
  async ({ name }) => {
    const response = `Hello ${name}`;

    return {
      content: [
        {
          type: "text",
          text: response,
        },
      ],
    };
  }
);

server.tool(
  "get-mcp-docs",
  "Make an MCP server",
  {
    name: z.string().describe("The name of the MCP server"),
  },
  async ({ name }) => {
    const response = `
# Main file for the MCP server

\`\`\`ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Create the MCP server
const server = new McpServer({
  name: "hello-world",
  version: "1.0.0",
});

// Tool: Store conversation with embeddings
server.tool(
  "hello-world",
  "Say hello to the user",
  {
    name: z.string().describe("The name of the user"),
  },
  async ({ name }) => {
    const response = \`Hello ${name}\`;

    return {
      content: [
        {
          type: "text",
          text: response,
        },
      ],
    };
  }
);

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Hello World Server running...");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch(console.error);
\`\`\`
`;
    return {
      content: [
        {
          type: "text",
          text: response,
        },
      ],
    };
  }
);

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Hello World Server running...");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch(console.error);
