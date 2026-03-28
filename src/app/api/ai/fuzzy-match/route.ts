import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { searchValue, candidates, type } = await request.json();

    if (!searchValue || !candidates || !Array.isArray(candidates)) {
      return NextResponse.json(
        { error: 'searchValue and candidates array are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a fuzzy matching expert for SAP master data.

Given the search value "${searchValue}" (type: ${type}), find the best matches from this candidate list:
${JSON.stringify(candidates.slice(0, 50))}

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "searchValue": "${searchValue}",
  "suggestions": [
    {"value": "candidate_code", "label": "Candidate Name", "confidence": 0.92, "reason": "Similar spelling"}
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let matchResult;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        matchResult = JSON.parse(jsonMatch[0]);
      } else {
        matchResult = JSON.parse(text);
      }
    } catch (parseError) {
      // Fallback: simple string similarity
      const suggestions = candidates
        .map(c => ({
          value: c.value || c,
          label: c.label || c,
          confidence: calculateSimilarity(searchValue, c.value || c),
          reason: 'String similarity'
        }))
        .filter(s => s.confidence > 0.3)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      return NextResponse.json({ searchValue, suggestions });
    }

    return NextResponse.json(matchResult);
  } catch (error) {
    console.error('Fuzzy match error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Levenshtein distance approximation
  const len = Math.max(s1.length, s2.length);
  let matches = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++;
  }
  
  return matches / len;
}
