# SelfHub MCP Server

**Your Personal AI Memory Hub** - Store and retrieve information from any MCP-enabled AI assistant.

##  What is SelfHub?

SelfHub is a Model Context Protocol (MCP) server that acts as your personal digital memory. Store notes, preferences, code snippets, and more - then access them from any AI assistant that supports MCP (Claude Desktop, VS Code Copilot, etc.).

##  Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Sagargupta16/SelfHub.git
cd SelfHub

# Install dependencies
pnpm install

# Build the project
pnpm build
```

### Usage with Claude Desktop

1. Build the server:
```bash
pnpm build
```

2. Add to Claude Desktop config:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "selfhub": {
      "command": "node",
      "args": ["C:/path/to/SelfHub/build/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

##  Available Tools (9 MCP Tools)

### Memory Management (5 tools)
- **store_memory** - Store new information
- **retrieve_memory** - Get a specific memory by ID
- **list_memories** - List memories with filters
- **search_memories** - Search by text query
- **delete_memory** - Delete a memory

### Context Management (3 tools)
- **create_context** - Create organization contexts
- **activate_context** - Activate and load context
- **list_contexts** - List all contexts

### Analytics (1 tool)
- **get_stats** - Get usage statistics

##  Example Usage

Once configured, ask Claude:

- "Store that I prefer TypeScript for all new projects"
- "Search my memories for typescript"
- "List all my learning-related memories"
- "Create a new context for the SelfHub project"
- "Show me my memory statistics"

##  Sample Data

Pre-loaded with 6 sample memories and 2 contexts:
- Dark mode preference
- TypeScript standard
- Vector embeddings note
- SelfHub project info
- Development task
- Code snippet

##  Development

```bash
# Run in development mode
pnpm dev

# Type check
pnpm typecheck

# Build
pnpm build
```

##  Project Structure

```
SelfHub/
 src/
    index.ts           # Main MCP server
    models/            # Type definitions
    services/          # Business logic
    storage/           # In-memory storage
 build/                 # Compiled output
 package.json
```

##  Current Features

-  In-memory storage (fast, resets on restart)
-  9 working MCP tools
-  Memory categorization and tagging
-  Context management
-  Text-based search
-  Sample data included

##  Future Enhancements

- [ ] Persistent SQLite storage
- [ ] Vector embeddings for semantic search
- [ ] File import/export
- [ ] Data encryption

##  License

MIT

##  Links

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/download)
