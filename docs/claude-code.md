# Claude Code Setup Guide

This guide configures Claude Code for the Pinthread MCP server.

## Overview

Claude Code connects to Pinthread through the Model Context Protocol (MCP).
Pinthread provides visual feedback from live websites.
Claude Code reads pinned comments, modifies code, and answers threads.

## Configuration File

Run `pinthread-init` in your project root:

```bash
npx pinthread-init claude-code
```

The command writes `.mcp.json`:

```json
{
  "mcpServers": {
    "pinthread": {
      "type": "http",
      "url": "https://pinthread.dev/mcp",
      "headers": {
        "Authorization": "Bearer ${PINTHREAD_TOKEN}"
      }
    }
  }
}
```

The file references `PINTHREAD_TOKEN`.
It does not contain hard-coded secret values.

## Setting the Token

Create an agent token in the Pinthread dashboard under **Agent access**.
Export the token in your shell:

```bash
export PINTHREAD_TOKEN="ptk_your_token_here"
```

## Prompting Claude Code

Add this rule to your `CLAUDE.md`:

```markdown
When I mention pinthread comments, use the pinthread MCP tools. List the open threads, read each one with get_thread, then make the change and check it. Reply with what you changed. Resolve a thread only when you are confident the fix is complete. If a comment is a question or needs a decision, reply and leave it open.
```
