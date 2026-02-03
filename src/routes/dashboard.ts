import { Env } from '../types';

export async function handleDashboard(env: Env): Promise<Response> {
  try {
    const themesResult = await env.DB.prepare(
      'SELECT theme_name, sentiment, summary, feedback_count FROM analysis_results ORDER BY feedback_count DESC'
    ).all<{
      theme_name: string;
      sentiment: string;
      summary: string;
      feedback_count: number;
    }>();

    const feedbackResult = await env.DB.prepare(
      'SELECT source, content FROM feedback ORDER BY timestamp DESC LIMIT 10'
    ).all<{
      source: string;
      content: string;
    }>();

    const themes = themesResult.results || [];
    const recentFeedback = feedbackResult.results || [];

    const sentimentCounts = {
      positive: themes.filter(t => t.sentiment === 'positive').length,
      neutral: themes.filter(t => t.sentiment === 'neutral').length,
      negative: themes.filter(t => t.sentiment === 'negative').length
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback Insights Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        h1 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        .actions {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }
        button {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        .btn-primary {
            background: #667eea;
            color: white;
        }
        .btn-primary:hover {
            background: #5568d3;
        }
        .btn-secondary {
            background: #48bb78;
            color: white;
        }
        .btn-secondary:hover {
            background: #38a169;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }
        .sentiment-positive { color: #48bb78; }
        .sentiment-neutral { color: #ed8936; }
        .sentiment-negative { color: #f56565; }
        .themes-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .themes-section h2 {
            margin-bottom: 20px;
            color: #333;
        }
        .theme-card {
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 15px;
            background: #f7fafc;
            border-radius: 6px;
        }
        .theme-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .theme-name {
            font-weight: 600;
            color: #333;
            font-size: 16px;
        }
        .theme-sentiment {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .sentiment-positive-bg { background: #c6f6d5; color: #22543d; }
        .sentiment-neutral-bg { background: #feebc8; color: #7c2d12; }
        .sentiment-negative-bg { background: #fed7d7; color: #742a2a; }
        .theme-summary {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .theme-count {
            color: #999;
            font-size: 12px;
        }
        .feedback-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .feedback-section h2 {
            margin-bottom: 20px;
            color: #333;
        }
        .feedback-item {
            padding: 15px;
            margin-bottom: 10px;
            background: #f7fafc;
            border-radius: 6px;
            border-left: 3px solid #cbd5e0;
        }
        .feedback-source {
            font-size: 11px;
            color: #667eea;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .feedback-content {
            color: #333;
            font-size: 14px;
            line-height: 1.5;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Feedback Insights Dashboard</h1>
            <p class="subtitle">Aggregated customer feedback analysis powered by Cloudflare Workers AI</p>
            <div class="actions">
                <button class="btn-primary" onclick="ingestFeedback()">Ingest Mock Feedback</button>
                <button class="btn-secondary" onclick="analyzeFeedback()">Analyze Feedback</button>
            </div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Themes</div>
                <div class="stat-value">${themes.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Positive</div>
                <div class="stat-value sentiment-positive">${sentimentCounts.positive}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Neutral</div>
                <div class="stat-value sentiment-neutral">${sentimentCounts.neutral}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Negative</div>
                <div class="stat-value sentiment-negative">${sentimentCounts.negative}</div>
            </div>
        </div>

        <div class="themes-section">
            <h2>Identified Themes</h2>
            ${themes.length === 0 
              ? '<div class="empty-state">No themes analyzed yet. Click "Analyze Feedback" to get started.</div>'
              : themes.map(theme => `
                <div class="theme-card">
                    <div class="theme-header">
                        <span class="theme-name">${escapeHtml(theme.theme_name)}</span>
                        <span class="theme-sentiment sentiment-${theme.sentiment}-bg">${theme.sentiment}</span>
                    </div>
                    <div class="theme-summary">${escapeHtml(theme.summary)}</div>
                    <div class="theme-count">${theme.feedback_count} feedback entries</div>
                </div>
              `).join('')
            }
        </div>

        <div class="feedback-section">
            <h2>Recent Feedback</h2>
            ${recentFeedback.length === 0
              ? '<div class="empty-state">No feedback entries yet. Click "Ingest Mock Feedback" to add sample data.</div>'
              : recentFeedback.map(fb => `
                <div class="feedback-item">
                    <div class="feedback-source">${escapeHtml(fb.source)}</div>
                    <div class="feedback-content">${escapeHtml(fb.content)}</div>
                </div>
              `).join('')
            }
        </div>
    </div>

    <script>
        async function ingestFeedback() {
            const btn = event.target;
            btn.disabled = true;
            btn.textContent = 'Ingesting...';
            
            try {
                const response = await fetch('/ingest', { method: 'POST' });
                const data = await response.json();
                alert(data.success ? 'Feedback ingested successfully!' : 'Error: ' + data.error);
                if (data.success) {
                    setTimeout(() => location.reload(), 1000);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.textContent = 'Ingest Mock Feedback';
            }
        }

        async function analyzeFeedback() {
            const btn = event.target;
            btn.disabled = true;
            btn.textContent = 'Analyzing...';
            
            try {
                const response = await fetch('/analyze', { method: 'POST' });
                const data = await response.json();
                alert(data.success ? 'Analysis complete!' : 'Error: ' + data.error);
                if (data.success) {
                    setTimeout(() => location.reload(), 1000);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.textContent = 'Analyze Feedback';
            }
        }
    </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
      status: 200
    });
  } catch (error) {
    return new Response(
      `Error loading dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 500
      }
    );
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
