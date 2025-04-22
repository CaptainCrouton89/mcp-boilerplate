# MCP Embedding Storage Server Boilerplate

A starter template for building an MCP server that stores and retrieves information using vector embeddings. This boilerplate provides the foundation for creating your own embedding-based knowledge store that can integrate with Claude or other MCP-compatible AI assistants.

## Purpose

This boilerplate helps you quickly start building:

- A personal knowledge base that remembers information for your AI assistant
- A semantic search interface for your documents or knowledge
- A vector store integration for AI assistants

## Features

- Store content with automatically generated embeddings
- Search content using semantic similarity
- Access content through both tools and resources
- Use pre-defined prompts for common operations

## How It Works

This MCP server template connects to vector embedding APIs to:

1. Process content and break it into sections
2. Generate embeddings for each section
3. Store both the content and embeddings in a database
4. Enable semantic search using vector similarity

When you search, the system finds the most relevant sections of stored content based on the semantic similarity of your query to the stored embeddings.

## Getting Started

```bash
# Clone the boilerplate
git clone https://github.com/yourusername/mcp-embedding-storage-boilerplate.git
cd mcp-embedding-storage-boilerplate

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Start the server
pnpm start
```

## Configuring for Development

After cloning and building, you'll need to:

1. Update the `package.json` with your project details
2. Modify the API integration in `src/` to use your preferred embedding service
3. Customize the tools and resources in `src/index.ts`

## Usage with Claude for Desktop

Add the following configuration to your `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "your-embedding-storage": {
      "command": "node /path/to/your/dist/index.js"
    }
  }
}
```

Then restart Claude for Desktop to connect to the server.

## Implementing Tools

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

## Implementing Resources

### search://{query}

Resource template for searching content.

Example usage: `search://machine learning basics`

## Implementing Prompts

### store-new-content

A prompt to help store new content with embeddings.

Parameters:

- `path`: Unique identifier path for the content
- `content`: The content to store

### search-knowledge

A prompt to search for knowledge.

Parameters:

- `query`: The search query

## Integration Options

You can integrate this boilerplate with various embedding APIs and vector databases:

1. OpenAI Embeddings API
2. Hugging Face embedding models
3. Chroma, Pinecone, or other vector databases
4. Vercel AI SDK

## License

MIT
