# SelfHub Usage Guide

## Quick Start

### 1. Build the Server

```bash
pnpm build
```

### 2. Configure Claude Desktop

Edit your Claude Desktop config file:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this configuration (update the path to match your installation):

```json
{
  "mcpServers": {
    "selfhub": {
      "command": "node",
      "args": ["C:/Code/GitHub/My Repos/ml-ai/SelfHub/build/index.js"]
    }
  }
}
```

### 3. Restart Claude Desktop

Close and reopen Claude Desktop. You should see the SelfHub tools available.

## Example Queries

Once configured, you can ask Claude:

### Store Information

- "Store that I prefer dark mode in all applications"
- "Remember that I use TypeScript for all new projects"
- "Save this code snippet: const sum = (a, b) => a + b"

### Retrieve & Search

- "Search my memories for typescript"
- "What are my UI preferences?"
- "Show me all my learning-related memories"
- "List memories about coding standards"

### Context Management

- "Create a new context called 'Machine Learning Project'"
- "Activate the SelfHub Development context"
- "List all my active contexts"

### Analytics

- "Show me statistics about my memories"
- "How many memories do I have?"

## Sample Data

The server comes with pre-loaded sample data:

### 6 Sample Memories

1. **mem_001** - Dark mode preference (personal)
2. **mem_002** - TypeScript standard (professional)
3. **mem_003** - Vector embeddings (learning)
4. **mem_004** - SelfHub project (projects)
5. **mem_005** - Development TODO (tasks)
6. **mem_006** - Code snippet (code)

### 2 Sample Contexts

1. **ctx_001** - SelfHub Development
2. **ctx_002** - AI & Machine Learning

## Tool Reference

### Memory Tools

#### store_memory

Store new information in your memory hub.

**Parameters:**

- `content` (required) - The information to store
- `type` - Memory type: short-term, long-term, contextual
- `category` - Category: personal, professional, learning, projects, etc.
- `title` - Optional title
- `tags` - Array of tags for organization
- `importance` - 1-5 importance level
- `contextId` - Associate with a context

**Example:**

```json
{
  "content": "I prefer TypeScript over JavaScript",
  "type": "long-term",
  "category": "professional",
  "tags": ["typescript", "preferences"],
  "importance": 4
}
```

#### retrieve_memory

Get a specific memory by its ID.

**Parameters:**

- `id` (required) - Memory ID (e.g., "mem_001")

#### search_memories

Search through your memories using text queries.

**Parameters:**

- `query` (required) - Search query
- `category` - Filter by category
- `type` - Filter by memory type
- `tags` - Filter by tags
- `limit` - Max results (default: 10)

#### list_memories

List memories with optional filters.

**Parameters:**

- `type` - Filter by type
- `category` - Filter by category
- `tags` - Filter by tags array
- `contextId` - Filter by context
- `limit` - Max results (default: 50)
- `offset` - Pagination offset
- `sortBy` - Sort field (createdAt, updatedAt, importance)
- `sortOrder` - asc or desc

#### delete_memory

Delete a memory by ID.

**Parameters:**

- `id` (required) - Memory ID to delete

### Context Tools

#### create_context

Create a new organizational context.

**Parameters:**

- `name` (required) - Context name
- `type` (required) - conversation, project, topic, temporal
- `description` - Optional description
- `tags` - Array of tags
- `memoryIds` - Initial memory IDs to include

#### activate_context

Activate a context and load its memories.

**Parameters:**

- `id` (required) - Context ID

#### list_contexts

List all contexts with optional filters.

**Parameters:**

- `type` - Filter by type
- `active` - Filter by active status (true/false)

### Analytics Tools

#### get_stats

Get usage statistics and insights.

**Returns:**

- Total memories count
- Memories by type breakdown
- Memories by category breakdown
- Total contexts
- Most used tags

## Troubleshooting

### Server not showing in Claude

1. Make sure the path in config is absolute and correct
2. Check that you built the project (`pnpm build`)
3. Restart Claude Desktop completely
4. Check Claude's developer console for errors

### Data not persisting

This is expected! The current version uses in-memory storage. Data resets when you restart the server. Future versions will add persistent storage.

### Command not found

Make sure you're using the correct commands:

- `pnpm dev` - Development mode
- `pnpm build` - Build for production
- `pnpm start` - Start built server

## Development

### Running Locally

```bash
# Development mode (auto-reload)
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck
```

### Testing with MCP Inspector

You can also test the server using the MCP Inspector:

```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector

# Run inspector
mcp-inspector node build/index.js
```

## Next Steps

This is a working prototype with in-memory storage. Future enhancements:

- [ ] Persistent SQLite database
- [ ] Vector embeddings for semantic search
- [ ] File import/export capabilities
- [ ] Data encryption for sensitive info
- [ ] Web UI for management

Enjoy using SelfHub! 🚀
