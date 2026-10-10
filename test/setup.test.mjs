import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, '..', 'bin', 'pinthread-init.mjs');

function runCli(args = [], env = {}, cwd = process.cwd()) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 5000,
    cwd,
    env: { ...process.env, ...env }
  });
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pt-init-test-'));
}

test('claude-code target generates valid .mcp.json in fresh directory', (t) => {
  const tmp = makeTempDir();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const res = runCli(['claude-code', tmp]);
  assert.equal(res.status, 0, `Process failed: ${res.stderr}`);

  const targetPath = path.join(tmp, '.mcp.json');
  assert.ok(fs.existsSync(targetPath), '.mcp.json was not created');

  const content = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  assert.deepEqual(content, {
    mcpServers: {
      pinthread: {
        type: 'http',
        url: 'https://pinthread.dev/mcp',
        headers: {
          Authorization: 'Bearer ${PINTHREAD_TOKEN}'
        }
      }
    }
  });
});

test('cursor target generates valid .cursor/mcp.json in fresh directory', (t) => {
  const tmp = makeTempDir();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const res = runCli(['cursor', tmp]);
  assert.equal(res.status, 0, `Process failed: ${res.stderr}`);

  const targetPath = path.join(tmp, '.cursor', 'mcp.json');
  assert.ok(fs.existsSync(targetPath), '.cursor/mcp.json was not created');

  const content = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  assert.deepEqual(content, {
    mcpServers: {
      pinthread: {
        url: 'https://pinthread.dev/mcp',
        headers: {
          Authorization: 'Bearer ${env:PINTHREAD_TOKEN}'
        }
      }
    }
  });
});

test('codex target generates valid .codex/config.toml in fresh directory', (t) => {
  const tmp = makeTempDir();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const res = runCli(['codex', tmp]);
  assert.equal(res.status, 0, `Process failed: ${res.stderr}`);

  const targetPath = path.join(tmp, '.codex', 'config.toml');
  assert.ok(fs.existsSync(targetPath), '.codex/config.toml was not created');

  const raw = fs.readFileSync(targetPath, 'utf8');
  assert.match(raw, /\[mcp_servers\.pinthread\]/);
  assert.match(raw, /url\s*=\s*"https:\/\/pinthread\.dev\/mcp"/);
  assert.match(raw, /bearer_token_env_var\s*=\s*"PINTHREAD_TOKEN"/);
});

test('refusal preserves existing file bytes atomically for claude-code', (t) => {
  const tmp = makeTempDir();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const targetPath = path.join(tmp, '.mcp.json');
  const existingBytes = '{"custom":"do-not-overwrite"}\n';
  fs.writeFileSync(targetPath, existingBytes, 'utf8');

  const res = runCli(['claude-code', tmp]);
  assert.notEqual(res.status, 0, 'CLI should exit non-zero when file exists');
  assert.match(res.stderr + res.stdout, /Refusing to overwrite|exists/i);

  const afterBytes = fs.readFileSync(targetPath, 'utf8');
  assert.equal(afterBytes, existingBytes, 'Existing file content was modified');
});

test('refusal preserves existing file bytes atomically for cursor', (t) => {
  const tmp = makeTempDir();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const cursorDir = path.join(tmp, '.cursor');
  fs.mkdirSync(cursorDir, { recursive: true });
  const targetPath = path.join(cursorDir, 'mcp.json');
  const existingBytes = '{"preserve":"cursor-bytes"}\n';
  fs.writeFileSync(targetPath, existingBytes, 'utf8');

  const res = runCli(['cursor', tmp]);
  assert.notEqual(res.status, 0, 'CLI should exit non-zero when file exists');
  assert.match(res.stderr + res.stdout, /Refusing to overwrite|exists/i);

  const afterBytes = fs.readFileSync(targetPath, 'utf8');
  assert.equal(afterBytes, existingBytes, 'Existing cursor file content was modified');
});

test('refusal preserves existing file bytes atomically for codex', (t) => {
  const tmp = makeTempDir();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const codexDir = path.join(tmp, '.codex');
  fs.mkdirSync(codexDir, { recursive: true });
  const targetPath = path.join(codexDir, 'config.toml');
  const existingBytes = '# Custom codex config\n';
  fs.writeFileSync(targetPath, existingBytes, 'utf8');

  const res = runCli(['codex', tmp]);
  assert.notEqual(res.status, 0, 'CLI should exit non-zero when file exists');
  assert.match(res.stderr + res.stdout, /Refusing to overwrite|exists/i);

  const afterBytes = fs.readFileSync(targetPath, 'utf8');
  assert.equal(afterBytes, existingBytes, 'Existing codex file content was modified');
});

test('secrets never persisted or read from environment', (t) => {
  const tmp = makeTempDir();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const testSecret = 'ptk_secret_super_private_token_12345';
  const res = runCli(['claude-code', tmp], { PINTHREAD_TOKEN: testSecret });
  assert.equal(res.status, 0);

  const targetPath = path.join(tmp, '.mcp.json');
  const raw = fs.readFileSync(targetPath, 'utf8');
  assert.ok(!raw.includes(testSecret), 'Raw secret from environment was leaked into configuration');
  assert.ok(raw.includes('${PINTHREAD_TOKEN}'), 'Template reference to PINTHREAD_TOKEN is missing');
});

test('help flag displays helpful usage and exits zero', () => {
  const res1 = runCli(['--help']);
  assert.equal(res1.status, 0);
  assert.match(res1.stdout, /pinthread-init/);
  assert.match(res1.stdout, /claude-code/);
  assert.match(res1.stdout, /cursor/);
  assert.match(res1.stdout, /codex/);

  const res2 = runCli(['-h']);
  assert.equal(res2.status, 0);
  assert.match(res2.stdout, /pinthread-init/);
});

test('invalid target argument exits non-zero', () => {
  const res = runCli(['unsupported-editor']);
  assert.notEqual(res.status, 0);
  assert.match(res.stderr + res.stdout, /invalid|unknown|supported/i);
});

test('missing target argument exits non-zero', () => {
  const res = runCli([]);
  assert.notEqual(res.status, 0);
  assert.match(res.stderr + res.stdout, /usage|target/i);
});

test('invalid target toString and __proto__ reject cleanly without TypeError', () => {
  const resToString = runCli(['toString']);
  assert.notEqual(resToString.status, 0);
  assert.doesNotMatch(resToString.stderr, /TypeError/);
  assert.match(resToString.stderr + resToString.stdout, /invalid target/i);

  const resProto = runCli(['__proto__']);
  assert.notEqual(resProto.status, 0);
  assert.doesNotMatch(resProto.stderr, /TypeError/);
  assert.match(resProto.stderr + resProto.stdout, /invalid target/i);
});

test('extra third positional argument rejects instead of silently ignoring', (t) => {
  const tmp = makeTempDir();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const res = runCli(['claude-code', tmp, 'extra-arg']);
  assert.notEqual(res.status, 0, 'CLI should exit non-zero when extra positional arguments are passed');
  assert.match(res.stderr + res.stdout, /too many arguments|unexpected argument|expected at most 2/i);
  assert.equal(fs.existsSync(path.join(tmp, '.mcp.json')), false, 'File should not be created when extra arguments are provided');
});
