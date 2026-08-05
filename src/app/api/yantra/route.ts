import { NextRequest, NextResponse } from 'next/server';
import { YANTRA_SYSTEM_PROMPT, buildYantraUserPrompt, type YantraAnalysis } from '@/lib/ai/yantra-prompt';

/**
 * POST /api/yantra/analyze
 * 
 * Accepts a behavioral pattern query and returns
 * a structured YANTRA analysis as JSON.
 * 
 * In production, this routes to your LLM provider.
 * Currently returns a deterministic analysis using the
 * Pattern Atlas data for demonstration.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context } = body as {
      query: string;
      context?: {
        dominantPatterns?: string[];
        currentTransit?: string;
        sadhanaStreaks?: { practice: string; days: number }[];
      };
    };

    if (!query || typeof query !== 'string' || query.length < 10) {
      return NextResponse.json(
        { error: 'Insufficient input. Describe the behavioral pattern in detail.' },
        { status: 400 }
      );
    }

    if (query.length > 2000) {
      return NextResponse.json(
        { error: 'Input exceeds maximum length. Be precise, not exhaustive.' },
        { status: 400 }
      );
    }

    // Build the full prompt for the AI system
    const userPrompt = buildYantraUserPrompt(query, context);
    const fullPrompt = YANTRA_SYSTEM_PROMPT + '\n\n' + userPrompt;

    // In production: call your LLM API here with fullPrompt
    // const completion = await callLLM(fullPrompt);
    // const analysis: YantraAnalysis = JSON.parse(completion);

    // For now, return the prompt structure so the frontend
    // can be developed against it. The prompt itself is the
    // critical deliverable — it constrains the AI's behavior.
    return NextResponse.json({
      status: 'prompt_ready',
      system_prompt_length: YANTRA_SYSTEM_PROMPT.length,
      user_prompt: userPrompt,
      forbidden_words_count: YANTRA_SYSTEM_PROMPT.split('\n').filter(
        line => line.startsWith('- "')
      ).length,
      note: 'Connect to LLM provider to receive full analysis. The system prompt enforces the Tantric Technologist persona, forbidden words, required lexicon, and strict JSON output schema.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'YANTRA processing error. The geometry requires recalibration.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/yantra/prompt
 * 
 * Returns the raw YANTRA system prompt for inspection.
 * This is intentionally exposed for development and
 * for the "Master Key" holders who want to understand
 * the constraint architecture.
 */
export async function GET() {
  return NextResponse.json({
    system_prompt: YANTRA_SYSTEM_PROMPT,
    forbidden_words: ['vibe', 'manifest', 'zodiac', 'energy healing', 'universe', 'journey', 'chakras', 'toxic', 'trauma', 'crystal', 'reiki', 'angel numbers', 'full moon ritual'],
    required_lexicon: ['geometry', 'architecture', 'pattern', 'loop', 'resonance', 'discernment', 'algorithm', 'mechanics', 'vector', 'structure', 'system', 'calculus', 'axis', 'coordinates', 'frequency', 'oscillation'],
  });
}
