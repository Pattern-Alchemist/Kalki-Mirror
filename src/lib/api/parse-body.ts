// =============================================================
// KALKI — parseBody helper (Vol. 6 #8)
// -------------------------------------------------------------
// The runtime half of the OpenAPI payload gate. Every POST/PUT/PATCH
// route that accepts a JSON body should parse via this helper:
//
//   const r = await parseBody(req, drillVerdictSchema);
//   if (!r.ok) return r.res;  // 400 with {error, issues:[{path,message}]}
//   const data = r.data;     // typed T
//
// The gate (tests/gates/openapi-payload.test.ts) pins the DOCUMENTATION
// half: every path with a requestBody must $ref a components.schemas
// entry, and every $ref must resolve. Together they prevent the
// "undocumented POST" class — a route that exists but whose body shape
// is folklore preserved only in route code.
//
// Failure modes:
//   invalid_json     → 400 {error:'invalid_json'}
//   schema_violation → 400 {error:'schema_violation', issues:[{path,message}]}
//
// Both shapes are documented in openapi.yaml under components.schemas.
// =============================================================

import { ZodSchema, ZodError } from 'zod';

export type ParseBodyResult<T> =
  | { ok: true; data: T }
  | { ok: false; res: Response };

/**
 * Parse and validate a JSON request body against a zod schema.
 * Returns a discriminated union: {ok:true,data} on success, {ok:false,res}
 * on failure (the .res is a ready-to-return 400 with the issue list).
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>,
): Promise<ParseBodyResult<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      res: Response.json(
        { error: 'invalid_json' },
        { status: 400 },
      ),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = (parsed.error as ZodError).issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return {
      ok: false,
      res: Response.json(
        { error: 'schema_violation', issues },
        { status: 400 },
      ),
    };
  }

  return { ok: true, data: parsed.data };
}
