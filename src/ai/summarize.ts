import { AnalysisResult, ThemeAnalysis } from '../types';

function repairJson(jsonString: string): string {
  let repaired = jsonString.trim();
  
  repaired = repaired.replace(/,\s*}/g, '}');
  repaired = repaired.replace(/,\s*]/g, ']');
  
  repaired = repaired.replace(/([}\]"])\s*([,}\]])/g, '$1$2');
  
  repaired = repaired.replace(/,\s*,/g, ',');
  
  const jsonMatch = repaired.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    repaired = jsonMatch[0];
  }
  
  let braceCount = 0;
  let bracketCount = 0;
  let inString = false;
  let escapeNext = false;
  let fixed = '';
  
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    
    if (escapeNext) {
      fixed += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      fixed += char;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      fixed += char;
      continue;
    }
    
    if (inString) {
      fixed += char;
      continue;
    }
    
    if (char === '{') {
      braceCount++;
      fixed += char;
    } else if (char === '}') {
      braceCount--;
      fixed += char;
    } else if (char === '[') {
      bracketCount++;
      fixed += char;
    } else if (char === ']') {
      bracketCount--;
      fixed += char;
    } else {
      fixed += char;
    }
  }
  
  while (braceCount > 0) {
    fixed += '}';
    braceCount--;
  }
  
  while (bracketCount > 0) {
    fixed += ']';
    bracketCount--;
  }
  
  return fixed;
}

const ANALYSIS_PROMPT = `Analyze the customer feedback entries below. Return ONLY a valid JSON object with this exact structure. No markdown, no code blocks, no explanation - just the JSON.

{
  "themes": [
    {
      "name": "Documentation Issues",
      "sentiment": "negative",
      "summary": "Users report unclear or missing documentation",
      "count": 8
    },
    {
      "name": "Feature Requests",
      "sentiment": "neutral",
      "summary": "Requests for new functionality",
      "count": 12
    }
  ]
}

Requirements:
- Return 3-5 themes
- Each theme needs: name (string), sentiment ("positive" or "neutral" or "negative"), summary (string), count (number)
- Ensure valid JSON syntax: proper quotes, commas, brackets
- Start with { and end with }
- No text before or after the JSON

Feedback entries:
`;

export async function analyzeFeedback(
  feedbackTexts: string[],
  ai: any
): Promise<AnalysisResult> {
  const feedbackBlock = feedbackTexts
    .map((text, idx) => `${idx + 1}. ${text}`)
    .join('\n');

  const fullPrompt = ANALYSIS_PROMPT + feedbackBlock;

  try {
    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are a product analyst. Always respond with valid JSON only, no markdown, no code blocks.'
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ]
    });

    let content: string = '';
    
    if (typeof response === 'string') {
      content = response;
    } else if (response && typeof response === 'object') {
      if (response.response) {
        content = typeof response.response === 'string' ? response.response : JSON.stringify(response.response);
      } else if (response.text) {
        content = response.text;
      } else if (response.choices && response.choices[0] && response.choices[0].message) {
        content = response.choices[0].message.content || JSON.stringify(response);
      } else {
        content = JSON.stringify(response);
      }
    } else {
      content = String(response);
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('Empty response from AI');
    }
    
    let jsonContent = content.trim();
    
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }
    
    jsonContent = jsonContent.trim();
    
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }
    
    jsonContent = repairJson(jsonContent);
    
    let parsed: AnalysisResult;
    try {
      parsed = JSON.parse(jsonContent) as AnalysisResult;
    } catch (parseError) {
      console.error('JSON parse error. Attempting repair...');
      console.error('Original content (first 500 chars):', jsonContent.substring(0, 500));
      
      jsonContent = repairJson(jsonContent);
      
      try {
        parsed = JSON.parse(jsonContent) as AnalysisResult;
      } catch (secondError) {
        console.error('Repair failed. Content:', jsonContent.substring(0, 1000));
        throw new Error(`JSON parsing failed after repair attempt: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
    }
    
    if (!parsed.themes || !Array.isArray(parsed.themes) || parsed.themes.length === 0) {
      throw new Error('Invalid response format from AI: missing or empty themes array');
    }

    return parsed;
  } catch (error) {
    console.error('AI analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error message:', errorMessage);
    
    const fallbackResult: AnalysisResult = {
      themes: [
        {
          name: 'General Feedback',
          sentiment: 'neutral',
          summary: `Unable to analyze feedback automatically: ${errorMessage}. Please review manually.`,
          count: feedbackTexts.length
        }
      ]
    };
    
    return fallbackResult;
  }
}
