# Cursor Setup Guide

This guide configures Cursor for the Pinthread MCP server.

## Overview

Cursor connects to Pinthread through the Model Context Protocol (MCP).
Pinthread provides visual feedback from live websites.
Cursor reads pinned comments, modifies code, and answers threads.

## Configuration File

Run `pinthread-init` in your project root:

```bash
npx pinthread-init cursor
```

The command writes `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "pinthread": {
      "url": "https://pinthread.dev/mcp",
      "headers": {
        "Authorization": "Bearer ${env:PINTHREAD_TOKEN}"
      }
    }
  }
}
```

Cursor expands `${env:PINTHREAD_TOKEN}` at runtime.
Commit this configuration file safely to source control.

## Setting the Token

Create an agent token in the Pinthread dashboard under **Agent access**.
Export the token in your environment before launching Cursor:

```bash
export PINTHREAD_TOKEN="ptk_your_token_here"
```

## Prompting Cursor

Add this rule to your Cursor project rules:

```markdown
When I mention pinthread comments, use the pinthread MCP tools. List the open threads, read each one with get_thread, then make the change and check it. Reply with what you changed. Resolve a thread only when you are confident the fix is complete. If a comment is a question or needs a decision, reply and leave it open.
```
