# Pinthread Setup and Documentation

This repository provides setup guides and the open-source `pinthread-init` helper for Pinthread.

Pinthread provides [visual feedback for AI agents](https://pinthread.dev).
Reviewers pin feedback on live websites.
Coding agents read those comments over MCP, edit code, and reply.

## Hosted Product and Public Helper

Pinthread is a hosted, closed-source web service.
The service hosts web dashboards, scripts, and MCP endpoints.
You can sign up and create projects at [https://pinthread.dev](https://pinthread.dev).

This repository and the `pinthread-init` package are public open-source tools.
They help you configure coding agents to connect to Pinthread over MCP.
They contain no private product code.

## Quick Start
Publication status: npm release pending. The commands below describe the planned npm release.
Until then, copy an example config, or clone this repository and run `node bin/pinthread-init.mjs <target>`.


Generate configuration files for your agent with `npx pinthread-init`.
Run the command in your project root:

### Claude Code

```bash
npx pinthread-init claude-code
```

This command creates `.mcp.json` in the current directory.

### Cursor

```bash
npx pinthread-init cursor
```

This command creates `.cursor/mcp.json` in the current directory.

### Codex

```bash
npx pinthread-init codex
```

This command creates `.codex/config.toml` in the current directory.

## Environment Secret

Get an agent token from **Agent access** in your Pinthread dashboard.
Export the token in your shell environment:

```bash
export PINTHREAD_TOKEN="ptk_your_token_here"
```

The generated configuration files reference `PINTHREAD_TOKEN`.
They never store raw secret values in project files.
`pinthread-init` never reads your environment variables.

## Safety Guarantees

The `pinthread-init` CLI provides these guarantees:
1. Zero dependencies and zero network access.
2. Refuses existing files atomically to prevent data loss.
3. Never reads or writes secret values.
4. Requires Node.js 20 or higher.

## Hosted setup and connection checks

Install the hosted script from [the install guide](https://pinthread.dev/install/) on your website.
Create an agent token in [Agent access](https://pinthread.dev/dashboard/), then start your agent with `PINTHREAD_TOKEN` set.
Ask the agent to call `whoami` to check its project and token scope.
Read tokens can list and read threads. Replying and resolving require a write token.
The hosted MCP endpoint accepts POST messages, not browser GET requests.
The helper writes configuration only. It does not install the widget or check authentication.

Setup facts checked on 10 October 2026:
- [Claude Code](https://pinthread.dev/use-cases/claude-code/)
- [Cursor](https://pinthread.dev/use-cases/cursor/)
- [Codex](https://pinthread.dev/use-cases/codex/)
- [Hosted MCP tools and scopes](https://pinthread.dev/mcp-server/)

## Documentation Guides

- [Claude Code Guide](https://github.com/Wladefant/pinthread-docs/blob/main/docs/claude-code.md)
- [Cursor Guide](https://github.com/Wladefant/pinthread-docs/blob/main/docs/cursor.md)
- [Codex Guide](https://github.com/Wladefant/pinthread-docs/blob/main/docs/codex.md)

## Examples

- [Claude Code Example](https://github.com/Wladefant/pinthread-docs/blob/main/examples/claude-code/.mcp.json)
- [Cursor Example](https://github.com/Wladefant/pinthread-docs/blob/main/examples/cursor/.cursor/mcp.json)
- [Codex Example](https://github.com/Wladefant/pinthread-docs/blob/main/examples/codex/.codex/config.toml)

## License

MIT License. See [LICENSE](https://github.com/Wladefant/pinthread-docs/blob/main/LICENSE).
