#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — MCP Lexicon server · stdio loop (Vol. 4 #15)
   ---------------------------------------------------------------------------
   Thin stdio transport over the protocol-pure dispatcher in core.ts.
   One JSON-RPC message per line (MCP stdio transport): read a line, dispatch,
   write a line. Notifications produce no output; logs go to STDERR only so
   stdout stays a clean protocol channel.

   Run from repo root:
     npx tsx mini-services/lexicon-mcp/server.ts

   MCP client registration (claude_desktop_config.json / mcp config):
     {
       "mcpServers": {
         "kalki-lexicon": {
           "command": "npx",
           "args": ["tsx", "<repo>/mini-services/lexicon-mcp/server.ts"]
         }
       }
     }

   ZERO runtime exposure: this process is local, stdio-only, read-only over
   build-time data modules. It never imports the DB, never binds a port,
   and is not deployed anywhere.
   ═══════════════════════════════════════════════════════════════════════════ */

import { createInterface } from 'readline';
import { handleLine, SERVER_NAME, SERVER_VERSION, PROTOCOL_VERSION } from './core';

function main(): void {
  // stdout stays protocol-only; everything human goes to stderr.
  process.stderr.write(`[${SERVER_NAME}] v${SERVER_VERSION} · MCP ${PROTOCOL_VERSION} · stdio · ctrl+D to detach\n`);

  const rl = createInterface({ input: process.stdin, terminal: false });
  rl.on('line', (line: string) => {
    try {
      const out = handleLine(line);
      if (out !== null) process.stdout.write(out + '\n');
    } catch (err) {
      // The dispatcher never throws by contract; this is a last-resort guard
      // so one bad line can never kill the server session.
      process.stderr.write(`[${SERVER_NAME}] frame error: ${err instanceof Error ? err.message : String(err)}\n`);
    }
  });
  rl.on('close', () => {
    process.stderr.write(`[${SERVER_NAME}] session closed\n`);
    process.exit(0);
  });
}

main();
