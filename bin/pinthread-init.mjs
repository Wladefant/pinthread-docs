#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const TARGET_CONFIGS = {
  'claude-code': {
    relPath: '.mcp.json',
    content: JSON.stringify(
      {
        mcpServers: {
          pinthread: {
            type: 'http',
            url: 'https://pinthread.dev/mcp',
            headers: {
              Authorization: 'Bearer ${PINTHREAD_TOKEN}'
            }
          }
        }
      },
      null,
      2
    ) + '\n'
  },
  cursor: {
    relPath: path.join('.cursor', 'mcp.json'),
    content: JSON.stringify(
      {
        mcpServers: {
          pinthread: {
            url: 'https://pinthread.dev/mcp',
            headers: {
              Authorization: 'Bearer ${env:PINTHREAD_TOKEN}'
            }
          }
        }
      },
      null,
      2
    ) + '\n'
  },
  codex: {
    relPath: path.join('.codex', 'config.toml'),
    content: `[mcp_servers.pinthread]\nurl = "https://pinthread.dev/mcp"\nbearer_token_env_var = "PINTHREAD_TOKEN"\n`
  }
};

function printHelp() {
  console.log(`pinthread-init — Scaffold token-free MCP configurations for Pinthread

Usage:
  npx pinthread-init <target> [directory]

Supported targets:
  claude-code    Writes .mcp.json for Claude Code
  cursor         Writes .cursor/mcp.json for Cursor
  codex          Writes .codex/config.toml for Codex CLI

Options:
  -h, --help     Show this help message

Notes:
  - Requires Node.js >=20.
  - Generates token-free templates referencing PINTHREAD_TOKEN.
  - Never reads or writes raw secrets.
  - Refuses to overwrite existing files atomically.
  - Learn more at https://pinthread.dev`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Error: Missing target argument.\n');
    printHelp();
    process.exit(1);
  }

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  if (args.length > 2) {
    console.error(`Error: Too many arguments. Expected at most 2 positional arguments (<target> [directory]), received ${args.length}.\n`);
    printHelp();
    process.exit(1);
  }

  const target = args[0];
  const targetDir = args[1] ? path.resolve(args[1]) : process.cwd();

  if (!Object.hasOwn(TARGET_CONFIGS, target)) {
    console.error(`Error: Invalid target "${target}". Supported targets: ${Object.keys(TARGET_CONFIGS).join(', ')}.\n`);
    printHelp();
    process.exit(1);
  }

  const config = TARGET_CONFIGS[target];

  const targetPath = path.join(targetDir, config.relPath);
  const dirPath = path.dirname(targetPath);

  try {
    fs.mkdirSync(dirPath, { recursive: true });
    // Write with 'wx' flag: fails atomically if path already exists
    fs.writeFileSync(targetPath, config.content, { flag: 'wx', encoding: 'utf8' });
  } catch (err) {
    if (err && err.code === 'EEXIST') {
      console.error(`Error: Refusing to overwrite existing file at "${targetPath}". Existing data was preserved.`);
      process.exit(1);
    }
    console.error(`Error writing configuration file: ${err.message}`);
    process.exit(1);
  }

  console.log(`Successfully generated Pinthread MCP configuration: ${targetPath}`);
  console.log('Next step: Set PINTHREAD_TOKEN in your environment (e.g. export PINTHREAD_TOKEN="ptk_...").');
}

main();
