# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Commands

### Development
- `pnpm run build` - Compile TypeScript to JavaScript in dist/ directory
- `pnpm start` - Run the compiled MCP server
- `pnpm install` - Install dependencies

### MCP Server Installation
- `pnpm run install-server` - Install to all MCP clients (Claude Desktop, Cursor, Claude Code, Gemini, MCP)
- `pnpm run install-desktop` - Install to Claude Desktop only
- `pnpm run install-cursor` - Install to Cursor only  
- `pnpm run install-code` - Install to Claude Code only
- `pnpm run install-mcp` - Install to .mcp.json only

Installation scripts automatically build the project and update the respective configuration files.

## Architecture

This is an MCP (Model Context Protocol) server boilerplate built with:

- **Core Framework**: @modelcontextprotocol/sdk for MCP server implementation
- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Language**: TypeScript with ES2022 target
- **Schema Validation**: Zod for parameter validation
- **Transport**: StdioServerTransport for communication

### Project Structure
```
src/
├── index.ts           # Main MCP server implementation
scripts/
├── update-config.js   # Multi-client configuration installer
dist/                  # Compiled JavaScript output
```

### Server Implementation Pattern

The server follows this pattern in src/index.ts:

1. **Server Creation**: `McpServer` instance with name and version
2. **Tool Registration**: Using `server.tool()` with Zod schema validation
3. **Transport Setup**: StdioServerTransport for client communication
4. **Error Handling**: Comprehensive error handling with process.exit(1)

### Tool Definition Pattern

Tools are defined with:
- Tool name (string)
- Description (string)  
- Parameters schema (Zod object)
- Async handler function returning `{ content: [{ type: "text", text: string }] }`

### Configuration Management

The `scripts/update-config.js` handles:
- Multi-client configuration (Claude Desktop, Cursor, Claude Code, Gemini, MCP)
- Environment variable parsing from .env.local
- Automatic directory creation for config files
- Command-line argument parsing for selective installation
- Local .mcp.json file creation for project-specific MCP configuration

### Key Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `zod` - Runtime type validation for tool parameters
- `axios` - HTTP client for external API calls

## Environment Variables

Optional `.env.local` file for environment variables that get automatically included in MCP server configuration.

## Development Workflow

1. Modify `src/index.ts` to add/update tools
2. Run `pnpm run build` to compile
3. Test with `pnpm start`
4. Use installation scripts to update MCP client configurations
5. Restart MCP clients to load changes