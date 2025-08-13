# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

### MCP Server Installation

- `pnpm run install-mcp` - Install to .mcp.json only (local development)

Installation scripts automatically:

- Build the TypeScript project
- Set executable permissions on dist/index.js
- Update client configuration files
- Parse and include .env.local environment variables

### Publishing and Release

- `pnpm run release` - Build, commit, push, and publish to npm registry
- `pnpm run build` - Compile TypeScript only

## Architecture

- **Schema Validation**: Zod for parameter validation
- **Transport**: StdioServerTransport for communication

### Project Structure

```
src/
├── index.ts                # Main MCP server implementation with example tools
scripts/
├── update-config.js        # Multi-client configuration installer
├── build-and-publish.js    # Automated release and npm publishing
dist/                       # Compiled JavaScript output (generated)
.env.local                  # Environment variables (optional)
package.json                # NPM package configuration
tsconfig.json               # TypeScript compiler configuration
```

## Environment Variables

Optional `.env.local` file for environment variables that get automatically included in MCP server configuration on installation.

## Development Workflow

### Local Development

1. Modify `src/index.ts` to add/update tools
2. Run `pnpm run install-mcp` to compile and install locally
3. **IMPORTANT**: Ask the user to restart the CLI to test new changes to the MCP tools
   - You should explicitly ask: "Please restart your CLI to load the new MCP tool changes"
   - MCP servers are loaded at startup, so a restart is required for changes to take effect

## Configuration Types

- **Production Clients**: Use `npx -y @r-mcp/<package>@latest` (auto-updating)
- **Local Development**: Use `node /absolute/path/to/dist/index.js` (for testing changes before publishing)

## Additional Resources

For more detailed examples of MCP server implementations (including weather APIs, resources, and prompts), please read `@mcp-guide.md` which contains comprehensive Python and TypeScript examples.

## Additional Notes

When the user asks you to test a tool, it means they want you to use the mcp corresponding to the tool you were working on. You should use the mcp**mcp-name**tool-name to execute the tool.

If there is no change in output, it's likely because the CLI needs to be restarted.
