# MCP Server Boilerplate

A starter template for building MCP (Model Context Protocol) servers. This boilerplate provides a clean foundation for creating your own MCP server that can integrate with Claude Desktop, Cursor, Claude Code, Gemini, and other MCP-compatible AI assistants.

## Purpose

This boilerplate helps you quickly start building:

- Custom tools for AI assistants
- Resource providers for dynamic content
- Prompt templates for common operations
- Integration points for external APIs and services

## Features

- Two example tools: "hello-world" and "get-mcp-docs"
- TypeScript support with ES2022 target and ES modules
- Multi-client installation scripts (Claude Desktop, Cursor, Claude Code, Gemini, etc.)
- Automatic npm publishing workflow
- Environment variable support via `.env.local`
- Clean project structure with Zod validation

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
# Install to all MCP clients (Claude Desktop, Cursor, Claude Code, Gemini, MCP)
pnpm run install-server

# Install to specific clients
pnpm run install-desktop       # Claude Desktop
pnpm run install-cursor        # Cursor IDE
pnpm run install-code          # Claude Code CLI
pnpm run install-code-library  # Claude Code Library (~/.claude/mcp-library/)
pnpm run install-mcp           # Local .mcp.json for development

# You can also combine multiple targets:
node scripts/update-config.js cursor code desktop
```

These scripts will:
- Build the project automatically (TypeScript compilation + chmod permissions)
- Configure clients to use `npx @r-mcp/<directory-name>@latest` (auto-updating)
- Only the local `.mcp.json` uses the development version (`node dist/index.js`)
- Include environment variables from `.env.local` if present

## Publishing Your Server

To publish your customized MCP server:

```bash
# Build, commit, and publish to npm in one command
pnpm run release
```

This script (`scripts/build-and-publish.js`) will:
1. Commit any pending changes first
2. Update package name to `@r-mcp/<directory-name>`
3. Update bin name to match directory
4. Increment patch version automatically
5. Build the TypeScript project
6. Commit version bump to git
7. Push to remote repository
8. Publish to npm with public access

## Usage with MCP Clients

The installation scripts automatically configure your MCP clients. For reference, here's what gets added:

### Production Clients (Claude Desktop, Cursor, Claude Code, Gemini):
```json
{
  "mcpServers": {
    "boilerplate": {
      "command": "npx",
      "args": ["-y", "@r-mcp/boilerplate@latest"],
      "env": {
        // Environment variables from .env.local are included here
      }
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
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        // Environment variables from .env.local are included here
      }
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
│   └── index.ts              # Main MCP server implementation
├── scripts/
│   ├── update-config.js      # Multi-client configuration installer
│   └── build-and-publish.js  # Automated npm publishing workflow
├── dist/                     # Compiled JavaScript (generated)
├── package.json              # Project configuration
├── tsconfig.json             # TypeScript configuration
├── CLAUDE.md                 # Claude Code instructions
├── .env.local                # Environment variables (optional)
└── README.md                 # This file
```

## Development Workflow

### Local Development
1. Make changes to `src/index.ts`
2. Run `pnpm run build` to compile TypeScript
3. Test your server with `pnpm start`
4. Use `pnpm run install-mcp` for local testing
5. Restart your MCP client to load changes

### Publishing Updates
1. Test your changes locally
2. Run `pnpm run release` to publish to npm
3. Clients using `npx @r-mcp/<your-package>@latest` auto-update
4. No client reconfiguration needed

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```bash
# .env.local
API_KEY=your-api-key
DATABASE_URL=your-database-url
```

These variables are automatically included in MCP server configurations during installation.

## Next Steps

1. Fork or clone this boilerplate
2. Customize the server name and tools in `src/index.ts`
3. Add your own tools, resources, and prompts
4. Configure environment variables in `.env.local`
5. Run `pnpm run release` to publish your server
6. Install to clients with `pnpm run install-server`

## License

MIT
