import { Env, FeedbackEntry } from '../types';

const MOCK_FEEDBACK: FeedbackEntry[] = [
  {
    source: 'support_ticket',
    content: 'The API rate limits are too restrictive. We keep hitting 429 errors during peak hours.',
    raw_data: JSON.stringify({ ticket_id: 'T-1234', priority: 'high' })
  },
  {
    source: 'github',
    content: 'Feature request: Add support for custom headers in Workers routing rules.',
    raw_data: JSON.stringify({ issue: '#456', labels: ['enhancement'] })
  },
  {
    source: 'discord',
    content: 'Love the new dashboard! The analytics are much clearer now.',
    raw_data: JSON.stringify({ channel: 'general', user: 'dev123' })
  },
  {
    source: 'twitter',
    content: 'Cloudflare Workers deployment is super fast. Best developer experience I\'ve had.',
    raw_data: JSON.stringify({ tweet_id: '789', likes: 42 })
  },
  {
    source: 'support_ticket',
    content: 'Documentation for D1 bindings is unclear. Spent hours trying to figure out the syntax.',
    raw_data: JSON.stringify({ ticket_id: 'T-1235', priority: 'medium' })
  },
  {
    source: 'github',
    content: 'Bug: Workers AI responses are inconsistent. Same prompt gives different results.',
    raw_data: JSON.stringify({ issue: '#457', labels: ['bug'] })
  },
  {
    source: 'discord',
    content: 'Can we get better error messages? The current ones don\'t tell me what went wrong.',
    raw_data: JSON.stringify({ channel: 'support', user: 'dev456' })
  },
  {
    source: 'email',
    content: 'The pricing calculator is confusing. Hard to estimate costs for our use case.',
    raw_data: JSON.stringify({ from: 'customer@example.com', subject: 'Pricing question' })
  },
  {
    source: 'support_ticket',
    content: 'R2 storage is great, but the upload speed could be faster for large files.',
    raw_data: JSON.stringify({ ticket_id: 'T-1236', priority: 'low' })
  },
  {
    source: 'github',
    content: 'Would love to see more examples of using Workers AI with streaming responses.',
    raw_data: JSON.stringify({ issue: '#458', labels: ['documentation'] })
  },
  {
    source: 'discord',
    content: 'The Wrangler CLI is amazing. Makes local development so much easier.',
    raw_data: JSON.stringify({ channel: 'general', user: 'dev789' })
  },
  {
    source: 'twitter',
    content: 'Having issues with CORS on Workers. The documentation doesn\'t cover edge cases.',
    raw_data: JSON.stringify({ tweet_id: '790', likes: 8 })
  },
  {
    source: 'support_ticket',
    content: 'Feature request: Add support for scheduled cron jobs in Workers.',
    raw_data: JSON.stringify({ ticket_id: 'T-1237', priority: 'high' })
  },
  {
    source: 'github',
    content: 'The Workers dashboard UI is slow when loading logs for high-traffic workers.',
    raw_data: JSON.stringify({ issue: '#459', labels: ['performance'] })
  },
  {
    source: 'discord',
    content: 'KV storage is perfect for our caching needs. No complaints!',
    raw_data: JSON.stringify({ channel: 'general', user: 'dev321' })
  },
  {
    source: 'email',
    content: 'The onboarding flow is too long. Consider simplifying the initial setup.',
    raw_data: JSON.stringify({ from: 'newuser@example.com', subject: 'Onboarding feedback' })
  },
  {
    source: 'support_ticket',
    content: 'Workers AI model selection is confusing. Which model should I use for summarization?',
    raw_data: JSON.stringify({ ticket_id: 'T-1238', priority: 'medium' })
  },
  {
    source: 'github',
    content: 'Great work on the new AI Search feature! This solves a real problem for us.',
    raw_data: JSON.stringify({ issue: '#460', labels: ['praise'] })
  },
  {
    source: 'discord',
    content: 'The error logs in dashboard don\'t show enough context. Hard to debug issues.',
    raw_data: JSON.stringify({ channel: 'support', user: 'dev654' })
  },
  {
    source: 'twitter',
    content: 'Cloudflare Workers + D1 is a game changer. Building APIs has never been easier.',
    raw_data: JSON.stringify({ tweet_id: '791', likes: 156 })
  },
  {
    source: 'support_ticket',
    content: 'Request: Add more granular permissions for team members accessing Workers.',
    raw_data: JSON.stringify({ ticket_id: 'T-1239', priority: 'medium' })
  },
  {
    source: 'github',
    content: 'Bug: D1 queries timeout occasionally. Happens more often with complex joins.',
    raw_data: JSON.stringify({ issue: '#461', labels: ['bug', 'd1'] })
  },
  {
    source: 'discord',
    content: 'The Workers playground is helpful for quick tests. Keep improving it!',
    raw_data: JSON.stringify({ channel: 'general', user: 'dev987' })
  },
  {
    source: 'email',
    content: 'Feature request: Add webhook support for Workers deployment events.',
    raw_data: JSON.stringify({ from: 'devops@example.com', subject: 'Webhook integration' })
  },
  {
    source: 'support_ticket',
    content: 'The pricing page doesn\'t clearly explain how Workers AI usage is calculated.',
    raw_data: JSON.stringify({ ticket_id: 'T-1240', priority: 'low' })
  },
  {
    source: 'github',
    content: 'Documentation for Workers AI is excellent. Clear examples and good explanations.',
    raw_data: JSON.stringify({ issue: '#462', labels: ['documentation'] })
  },
  {
    source: 'discord',
    content: 'Would love to see more pre-built templates for common Worker patterns.',
    raw_data: JSON.stringify({ channel: 'general', user: 'dev111' })
  },
  {
    source: 'twitter',
    content: 'The Workers analytics dashboard needs better filtering options.',
    raw_data: JSON.stringify({ tweet_id: '792', likes: 23 })
  },
  {
    source: 'support_ticket',
    content: 'R2 integration with Workers is seamless. Great developer experience.',
    raw_data: JSON.stringify({ ticket_id: 'T-1241', priority: 'low' })
  },
  {
    source: 'github',
    content: 'Feature request: Add support for environment-specific configuration in wrangler.toml.',
    raw_data: JSON.stringify({ issue: '#463', labels: ['enhancement'] })
  },
  {
    source: 'discord',
    content: 'The Workers runtime errors are sometimes cryptic. Better error messages needed.',
    raw_data: JSON.stringify({ channel: 'support', user: 'dev222' })
  }
];

export async function handleIngest(env: Env): Promise<Response> {
  try {
    const insertedIds: number[] = [];
    
    for (const feedback of MOCK_FEEDBACK) {
      const result = await env.DB.prepare(
        'INSERT INTO feedback (source, content, raw_data) VALUES (?, ?, ?)'
      )
        .bind(feedback.source, feedback.content, feedback.raw_data || null)
        .run();
      
      if (result.meta.last_row_id) {
        insertedIds.push(result.meta.last_row_id as number);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Inserted ${insertedIds.length} feedback entries`,
        ids: insertedIds
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}
