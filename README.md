# MCP Embedding Storage Server

An MCP server for storing and retrieving information using vector embeddings via the [AI Embeddings API](https://ai-embeddings.vercel.app/).

## Features

- Store content with automatically generated embeddings
- Search content using semantic similarity
- Access content through both tools and resources
- Use pre-defined prompts for common operations

## How It Works

This MCP server connects to the AI Embeddings API, which:

1. Processes content and breaks it into sections
2. Generates embeddings for each section
3. Stores both the content and embeddings in a database
4. Enables semantic search using vector similarity

When you search, the API finds the most relevant sections of stored content based on the semantic similarity of your query to the stored embeddings.

## Installation

```bash
# Install with npm
npm install -g mcp-embedding-storage

# Or with pnpm
pnpm add -g mcp-embedding-storage

# Or with yarn
yarn global add mcp-embedding-storage
```

## Usage with Claude for Desktop

Add the following configuration to your `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "embedding-storage": {
      "command": "mcp-embedding-storage"
    }
  }
}
```

Then restart Claude for Desktop to connect to the server.

## Available Tools

### store-content

Stores content with automatically generated embeddings.

Parameters:

- `content`: The content to store
- `path`: Unique identifier path for the content
- `type` (optional): Content type (e.g., 'markdown')
- `source` (optional): Source of the content
- `parentPath` (optional): Path of the parent content (if applicable)

### search-content

Searches for content using vector similarity.

Parameters:

- `query`: The search query
- `maxMatches` (optional): Maximum number of matches to return

## Available Resources

### search://{query}

Resource template for searching content.

Example usage: `search://machine learning basics`

## Available Prompts

### store-new-content

A prompt to help store new content with embeddings.

Parameters:

- `path`: Unique identifier path for the content
- `content`: The content to store

### search-knowledge

A prompt to search for knowledge.

Parameters:

- `query`: The search query

## API Integration

This MCP server integrates with the AI Embeddings API at https://ai-embeddings.vercel.app/ with the following endpoints:

1. **Generate Embeddings** (`POST /api/generate-embeddings`)

   - Generates embeddings for content and stores them in the database
   - Required parameters: `content` and `path`

2. **Vector Search** (`POST /api/vector-search`)
   - Searches for content based on semantic similarity
   - Required parameter: `prompt`

## Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-embedding-storage.git
cd mcp-embedding-storage

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Start the server
pnpm start
```

## License

MIT
