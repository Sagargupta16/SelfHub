# SelfHub MCP Server

**Your Personal AI Memory Hub** - Store and retrieve your personal data from any MCP-enabled AI assistant.

## 🎯 What is SelfHub?

SelfHub is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that acts as your personal digital memory. Store notes, preferences, code snippets, tasks, and any information you want - then access them seamlessly from any AI assistant that supports MCP (Claude Desktop, VS Code Copilot, etc.).

Think of it as your **personal knowledge base that travels with you across all AI conversations**.

## ✨ Features

- 🧠 **9 MCP Tools** - Store, retrieve, search, and manage your memories
- 🏷️ **Smart Organization** - Categories, tags, and importance levels
- 📂 **Context Management** - Group memories by project, topic, or conversation
- 🔍 **Text Search** - Find information quickly with keyword search
- 📊 **Analytics** - Track your memory usage and patterns
- ⚡ **Fast & Lightweight** - In-memory storage with instant responses
- 🎁 **Sample Data** - Pre-loaded with 6 example memories to get started

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **pnpm** 9.x or higher
- **Claude Desktop** or **VS Code** with GitHub Copilot

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

## 📱 Setup with Claude Desktop

### Step 1: Build the Server

```bash
pnpm build
```

### Step 2: Configure Claude Desktop

Open the Claude Desktop configuration file:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Add this configuration (replace with your actual path):

```json
{
  "mcpServers": {
    "selfhub": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\SelfHub\\build\\index.js"]
    }
  }
}
```

**Important for Windows:** Use double backslashes (`\\`) in the path!

### Step 3: Restart Claude Desktop

Completely quit and restart Claude Desktop.

### Step 4: Test It!

In Claude, try:

- "List all my memories"
- "Search my memories for typescript"
- "Store that I prefer dark mode in all applications"

## 💻 Setup with VS Code

### Step 1: Build the Server

```bash
pnpm build
```

### Step 2: Configure VS Code

The workspace is already configured! Just reload VS Code:

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) → Type "Reload Window" → Press Enter

### Step 3: Test in Copilot Chat

Open GitHub Copilot Chat (`Ctrl+Alt+I`) and try:

```
@workspace list my memories
@workspace search my memories for "typescript"
@workspace store in my memory: I love using pnpm for package management
```

**Note:** You need GitHub Copilot extension installed and enabled.

## 🛠️ Available Tools

### Memory Management (5 tools)

#### 1. `store_memory`

Store new information in your memory hub.

**Example:**

```
Store that I prefer TypeScript over JavaScript for all new projects
```

**Parameters:**

- `content` (required) - The information to store
- `type` - Memory type: `short-term`, `long-term`, `contextual`
- `category` - Category: `personal`, `professional`, `learning`, `projects`, `code`, `tasks`, etc.
- `title` - Optional title
- `tags` - Array of tags
- `importance` - 1-5 importance level

#### 2. `retrieve_memory`

Get a specific memory by its ID.

**Example:**

```
Retrieve memory mem_001
```

#### 3. `list_memories`

List memories with optional filters.

**Example:**

```
List all my professional memories
Show me memories tagged with 'typescript'
List memories sorted by importance
```

**Parameters:**

- `type` - Filter by type
- `category` - Filter by category
- `tags` - Filter by tags
- `contextId` - Filter by context
- `limit` - Max results (default: 50)
- `offset` - Pagination offset
- `sortBy` - Sort field: `createdAt`, `updatedAt`, `importance`, `accessCount`
- `sortOrder` - `asc` or `desc`

#### 4. `search_memories`

Search through your memories using text queries.

**Example:**

```
Search my memories for "typescript"
Find memories about "API design"
```

**Parameters:**

- `query` (required) - Search query
- `category` - Filter by category
- `type` - Filter by type
- `tags` - Filter by tags
- `limit` - Max results (default: 10)

#### 5. `delete_memory`

Delete a memory by ID.

**Example:**

```
Delete memory mem_005
```

### Context Management (3 tools)

#### 6. `create_context`

Create a new organizational context.

**Example:**

```
Create a new context called "Machine Learning Project" for project type
```

**Parameters:**

- `name` (required) - Context name
- `type` (required) - `conversation`, `project`, `topic`, `temporal`
- `description` - Optional description
- `tags` - Array of tags
- `memoryIds` - Initial memory IDs to include

#### 7. `activate_context`

Activate a context and load its memories.

**Example:**

```
Activate the "SelfHub Development" context
```

#### 8. `list_contexts`

List all contexts with optional filters.

**Example:**

```
List all my project contexts
Show active contexts
```

### Analytics (1 tool)

#### 9. `get_stats`

Get usage statistics and insights.

**Example:**

```
Show me my memory statistics
```

**Returns:**

- Total memories count
- Memories by type breakdown
- Memories by category breakdown
- Total contexts
- Most used tags

## 📚 Example Usage Scenarios

### Personal Knowledge Management

```
Store that I prefer dark mode in all applications
Store my favorite TypeScript coding conventions
Remember that I use pnpm for package management
Search my memories for "preferences"
```

### Project Development

```
Create a new context called "SelfHub Development" for project type
Store in SelfHub context: Database schema uses Drizzle ORM
Activate the SelfHub Development context
List all memories in the SelfHub context
```

### Learning & Notes

```
Store as learning: Vector embeddings represent text as numerical arrays
Tag with "machine-learning" and "embeddings"
Search my learning memories for "embeddings"
List all my learning-related memories sorted by date
```

### Code Snippets

```
Store this code snippet: const sum = (a, b) => a + b
Category: code, Tags: javascript, utility
Search my code for "utility functions"
```

## 🗂️ Sample Data

SelfHub comes with 6 pre-loaded sample memories:

1. **mem_001** - Dark mode UI preference (personal)
2. **mem_002** - TypeScript coding standard (professional)
3. **mem_003** - Vector embeddings concept (learning)
4. **mem_004** - SelfHub project overview (projects)
5. **mem_005** - Database development task (tasks)
6. **mem_006** - ID generation utility code (code)

And 2 sample contexts:

1. **ctx_001** - SelfHub Development (project)
2. **ctx_002** - AI & Machine Learning (topic)

## 🏗️ Project Structure

```
SelfHub/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── models/               # TypeScript type definitions
│   │   ├── memory.model.ts
│   │   ├── context.model.ts
│   │   └── index.ts
│   ├── services/             # Business logic layer
│   │   ├── memory.service.ts
│   │   └── context.service.ts
│   └── storage/              # Storage implementation
│       └── mock-storage.ts   # In-memory mock data
├── build/                    # Compiled JavaScript output
├── .github/                  # GitHub Actions CI/CD
│   └── workflows/
│       ├── ci.yml           # Continuous Integration
│       └── release.yml      # Automated releases
├── .vscode/                 # VS Code configuration
│   └── settings.json        # MCP server settings
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
# Development mode (auto-reload with tsx)
pnpm dev

# Type checking
pnpm typecheck

# Build for production
pnpm build

# Clean build directory
rm -rf build
```

### How It Works

1. **MCP Server** (`src/index.ts`) - Implements the MCP protocol, defines 9 tools
2. **Services Layer** - Business logic for memory and context operations
3. **Storage Layer** - In-memory Map-based storage with sample data
4. **Models** - TypeScript interfaces for type safety

### Testing Locally

```bash
# Start the server
pnpm dev

# You should see:
# 🚀 SelfHub MCP Server running with mock data!
# 📊 Loaded 6 sample memories and 2 sample contexts
# 🛠️  Available tools: 9
```

The server runs on **stdio** (standard input/output) and waits for MCP protocol messages. You cannot interact with it directly - it needs an MCP client like Claude Desktop or VS Code.

## 🐛 Troubleshooting

### Server Not Showing in Claude Desktop

1. **Check the config path:**

   - Make sure you're editing the correct config file
   - Use absolute path, not relative

2. **Verify build exists:**

   ```bash
   ls build/index.js
   ```

3. **Check for typos:**

   - Windows paths need double backslashes: `C:\\path\\to\\`
   - JSON syntax must be valid

4. **Restart Claude completely:**

   - Quit from system tray
   - Wait a few seconds
   - Start again

5. **Check Claude logs:**
   - Windows: `%APPDATA%\Claude\logs`
   - macOS: `~/Library/Logs/Claude`

### VS Code Not Showing Tools

1. **Make sure GitHub Copilot is installed:**

   - Press `Ctrl+Shift+X`
   - Search "GitHub Copilot"
   - Install both "GitHub Copilot" and "GitHub Copilot Chat"

2. **Reload VS Code window:**

   - `Ctrl+Shift+P` → "Reload Window"

3. **Check the build:**
   ```bash
   pnpm build
   ```

### Build Errors

```bash
# Clean and rebuild
rm -rf build node_modules
pnpm install
pnpm build
```

### Data Not Persisting

This is expected! The current version uses **in-memory storage**. All data resets when you restart the server. This is intentional for the initial version - persistent storage will be added in a future update.

## 🚀 CI/CD

This project includes GitHub Actions workflows:

- **CI Pipeline** - Runs on every push, tests on Node 18.x and 20.x
- **Release Workflow** - Creates releases when you push version tags
- **Dependabot** - Automatically updates dependencies

See `.github/workflows/` for details.

## 📖 Documentation

- [Model Context Protocol](https://modelcontextprotocol.io/) - Learn about MCP
- [Claude Desktop](https://claude.ai/download) - Download Claude Desktop
- [GitHub Copilot](https://github.com/features/copilot) - Learn about Copilot

## 🗺️ Roadmap

### Current Version (v0.1.0)

- ✅ In-memory storage
- ✅ 9 MCP tools
- ✅ Memory categorization and tagging
- ✅ Context management
- ✅ Text-based search
- ✅ Sample data

### Future Enhancements

- [ ] Persistent SQLite storage
- [ ] Vector embeddings for semantic search
- [ ] File import/export (JSON, Markdown, CSV)
- [ ] Data encryption for sensitive information
- [ ] Web UI for management
- [ ] Multi-user support
- [ ] Cloud sync

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 💬 Support

If you have questions or run into issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the documentation above
3. Open an issue on GitHub

## 🌟 Acknowledgments

Built with:

- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk) - MCP implementation
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [pnpm](https://pnpm.io/) - Fast package manager

---

**Made with ❤️ by [Sagargupta16](https://github.com/Sagargupta16)**

_Your personal AI memory hub - remember everything, access anywhere!_
