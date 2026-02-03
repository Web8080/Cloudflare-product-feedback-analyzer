import { Env } from '../types';
import { analyzeFeedback } from '../ai/summarize';

export async function handleAnalyze(env: Env): Promise<Response> {
  try {
    const feedbackResult = await env.DB.prepare(
      'SELECT content FROM feedback ORDER BY timestamp DESC LIMIT 50'
    ).all<{ content: string }>();

    if (!feedbackResult.results || feedbackResult.results.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No feedback entries found. Please ingest feedback first.'
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const feedbackTexts = feedbackResult.results.map(row => row.content);
    
    const analysis = await analyzeFeedback(feedbackTexts, env.AI);

    await env.DB.prepare('DELETE FROM analysis_results').run();

    for (const theme of analysis.themes) {
      await env.DB.prepare(
        'INSERT INTO analysis_results (theme_name, sentiment, summary, feedback_count) VALUES (?, ?, ?, ?)'
      )
        .bind(theme.name, theme.sentiment, theme.summary, theme.count)
        .run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during analysis'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}
