import { NextRequest, NextResponse } from 'next/server';
import { aiMapColumns, SmartMappingResult } from '@/lib/smart-order/ai';

// In-memory store for development (replaced with storage.ts in production)
const batchStore = new Map<string, unknown>();

export async function POST(req: NextRequest) {
  try {
    const { headers, sampleData, detectedFormat, batchName } = await req.json();
    
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return NextResponse.json(
        { error: 'Headers are required' },
        { status: 400 }
      );
    }
    
    // Check if Gemini API key is available
    const geminiKey = process.env.GEMINI_API_KEY;
    let mappingResult: SmartMappingResult;
    
    if (geminiKey) {
      // Use AI mapping
      try {
        mappingResult = await aiMapColumns(
          headers,
          sampleData,
          batchName || 'Unknown',
          detectedFormat || 'unknown'
        );
      } catch (error) {
        console.warn('AI mapping failed, using heuristic fallback:', error);
        // Fallback to heuristic if AI fails
        const { heuristicMapping } = await import('@/lib/smart-order/ai');
        mappingResult = heuristicMapping(headers);
      }
    } else {
      // No API key, use heuristic mapping
      console.log('No Gemini API key, using heuristic mapping');
      const { heuristicMapping } = await import('@/lib/smart-order/ai');
      mappingResult = heuristicMapping(headers);
    }
    
    return NextResponse.json({
      success: true,
      mapping: mappingResult.mappings,
      confidence: mappingResult.confidence,
      unmapped: mappingResult.unmapped_columns,
      suggestions: mappingResult.suggestions || {},
      warnings: mappingResult.warnings || [],
      message: `Mapped ${Object.keys(mappingResult.mappings).length} columns with ${Math.round((mappingResult.confidence || 0) * 100)}% confidence`
    });
    
  } catch (error) {
    console.error('AI Mapping error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI mapping failed' },
      { status: 500 }
    );
  }
}
