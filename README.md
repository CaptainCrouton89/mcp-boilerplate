# MCP Server Boilerplate

A starter template for building MCP (Model Context Protocol) servers. This boilerplate provides a clean foundation for creating your own MCP server that can integrate with Claude, Cursor, or other MCP-compatible AI assistants.

## Purpose

This boilerplate helps you quickly start building:

- Custom tools for AI assistants
- Resource providers for dynamic content
- Prompt templates for common operations
- Integration points for external APIs and services

## Features

- Simple "hello-world" tool example
- TypeScript support with proper type definitions
- Easy installation scripts for different MCP clients
- Clean project structure ready for customization

## How It Works

This MCP server template provides:

1. A basic server setup using the MCP SDK
2. Example tool implementation
3. Build and installation scripts
4. TypeScript configuration for development

The included example demonstrates how to create a simple tool that takes a name parameter and returns a greeting.

## Getting Started

### Option 1: Use the Published Package (Recommended)

You can use this MCP server directly without cloning:

```bash
# Run the server directly with npx
npx @r-mcp/boilerplate
```

### Option 2: Customize and Develop

```bash
# Clone the boilerplate
git clone <your-repo-url>
cd mcp-server-boilerplate

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Start the server
pnpm start
```

## Installation Scripts

This boilerplate includes convenient installation scripts for different MCP clients:

```bash
# Install to all MCP clients
pnpm run install-server

# Install to specific clients
pnpm run install-desktop    # Claude Desktop
pnpm run install-cursor     # Cursor IDE
pnpm run install-code       # Claude Code CLI
pnpm run install-code-library  # Claude Code Library

# Install locally for development only
pnpm run install-mcp         # Creates .mcp.json for local development
```

These scripts will:
- Build the project automatically
- Configure clients to use `npx @r-mcp/boilerplate@latest` (always gets the latest published version)
- Only the local `.mcp.json` uses the development version (`node dist/index.js`)

## Publishing Your Server

To publish your customized MCP server:

```bash
# Build, commit, and publish to npm in one command
pnpm run release
```

This script will:
1. Update the package name based on directory name
2. Increment the version number
3. Build the project
4. Commit changes to git
5. Push to remote repository
6. Publish to npm registry

## Usage with MCP Clients

The installation scripts automatically configure your MCP clients. For reference, here's what gets added:

### Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "boilerplate": {
      "command": "npx",
      "args": ["@r-mcp/boilerplate@latest"]
    }
  }
}
```

### Local Development (`.mcp.json`):
```json
{
  "mcpServers": {
    "boilerplate": {
      "command": "node",
      "args": ["/path/to/dist/index.js"]
    }
  }
}
```

After running installation scripts, restart your MCP client to connect to the server.

## Customizing Your Server

### Adding Tools

Tools are functions that the AI assistant can call. Here's the basic structure:

```typescript
server.tool(
  "tool-name",
  "Description of what the tool does",
  {
    // Zod schema for parameters
    param1: z.string().describe("Description of parameter"),
    param2: z.number().optional().describe("Optional parameter"),
  },
  async ({ param1, param2 }) => {
    // Your tool logic here
    return {
      content: [
        {
          type: "text",
          text: "Your response",
        },
      ],
    };
  }
);
```

### Adding Resources

Resources provide dynamic content that the AI can access:

```typescript
server.resource(
  "resource://example/{id}",
  "Description of the resource",
  async (uri) => {
    // Extract parameters from URI
    const id = uri.path.split("/").pop();

    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: `Content for ${id}`,
        },
      ],
    };
  }
);
```

### Adding Prompts

Prompts are reusable templates:

```typescript
server.prompt(
  "prompt-name",
  "Description of the prompt",
  {
    // Parameters for the prompt
    topic: z.string().describe("The topic to discuss"),
  },
  async ({ topic }) => {
    return {
      description: `A prompt about ${topic}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please help me with ${topic}`,
          },
        },
      ],
    };
  }
);
```

## Project Structure

```
├── src/
│   └── index.ts          # Main server implementation
├── scripts/              # Installation and utility scripts
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Development

1. Make changes to `src/index.ts`
2. Run `pnpm run build` to compile
3. Test your server with `pnpm start`
4. Use the installation scripts to update your MCP client configuration

## Next Steps

1. Update `package.json` with your project details
2. Customize the server name and tools in `src/index.ts`
3. Add your own tools, resources, and prompts
4. Integrate with external APIs or databases as needed

## License

MIT
