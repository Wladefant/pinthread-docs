# Codex Setup Guide

This guide configures Codex CLI for the Pinthread MCP server.

## Overview

Codex connects to Pinthread through the Model Context Protocol (MCP).
Pinthread provides visual feedback from live websites.
Codex reads pinned comments, modifies code, and answers threads.

## Configuration File

Run `pinthread-init` in your project root:

```bash
npx pinthread-init codex
```

The command writes `.codex/config.toml`:

```toml
[mcp_servers.pinthread]
url = "https://pinthread.dev/mcp"
bearer_token_env_var = "PINTHREAD_TOKEN"
```

Codex reads the token from the environment variable named in `bearer_token_env_var`.
Commit this configuration file safely to source control.

## Setting the Token

Create an agent token in the Pinthread dashboard under **Agent access**.
Export the token in your shell:

```bash
export PINTHREAD_TOKEN="ptk_your_token_here"
```

## Prompting Codex

Add this instruction to your `AGENTS.md`:

```markdown
When I mention pinthread comments, use the pinthread MCP tools. List the open threads, read each one with get_thread, then make the change and check it. Reply with what you changed. Resolve a thread only when you are confident the fix is complete. If a comment is a question or needs a decision, reply and leave it open.
```
