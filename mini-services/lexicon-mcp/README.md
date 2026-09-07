# kalki-lexicon-mcp (Vol. 4 #15)

A **local stdio MCP server** that exposes the KALKI lexicon and corpus truth
to AI-assisted authoring — so an editor (or the founder working with any MCP
client) can pull exact term definitions, pattern language, and corpus counts
instead of re-pasting context by hand.

## Tools

| Tool | Input | What it returns |
|------|-------|-----------------|
| `search_lexicon` | `{ query, limit? }` | Ranked lexicon hits (term, sanskrit, category, definition, relatedTerms) |
| `get_term` | `{ term }` | One term by English or Sanskrit, incl. linked folio slugs + hi-bridge definition (top-20) |
| `get_pattern` | `{ pattern }` | One behavioral pattern by slug/name: signs, origin, practice, linked folios, minTier |
| `corpus_stats` | `{}` | Corpus truth: 327 chunks, vocabulary size, embedder identity, 86 terms, pattern/folio counts |

## Data discipline

Reads **the same build-time data modules the site reads**
(`src/lib/data/glossary.ts`, `patterns.ts`, `siddhis.ts`) plus the
bake-derived `src/lib/rag/idf-generated.ts`. Zero runtime exposure:

- no DB client, no network, no port — stdio only;
- nothing here is deployed, served, or reachable from the site;
- authoring-side only, by construction.

The numbers agree with the site's canonical-count tests by importing the
same modules those tests pin — the server cannot drift from the site.

## Run

```bash
# from repo root — speak MCP over stdio (one JSON-RPC message per line)
npx tsx mini-services/lexicon-mcp/server.ts
```

### Register with an MCP client (e.g. Claude Desktop)

```json
{
  "mcpServers": {
    "kalki-lexicon": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/Kalki-Mirror/mini-services/lexicon-mcp/server.ts"]
    }
  }
}
```

### Smoke by hand

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"corpus_stats","arguments":{}}}' \
  | npx tsx mini-services/lexicon-mcp/server.ts 2>/dev/null
```

## Protocol notes

- JSON-RPC 2.0 over stdio, newline-delimited (MCP stdio transport,
  protocol version `2024-11-05`).
- Notifications (messages without `id`) are never answered.
- Unknown methods → `-32601`; malformed JSON → `-32700` with `id:null`;
  tool failures are reported in-band (`isError: true`), never as crashes.
- Protocol conformance is pinned in `tests/lib/lexicon-mcp.test.ts`
  (initialize handshake, tools/list schema, every tool, error paths).
