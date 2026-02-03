import { Env } from './types';
import { handleIngest } from './routes/ingest';
import { handleAnalyze } from './routes/analyze';
import { handleDashboard } from './routes/dashboard';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (path === '/' && method === 'GET') {
      return handleDashboard(env);
    }

    if (path === '/ingest' && method === 'POST') {
      return handleIngest(env);
    }

    if (path === '/analyze' && method === 'POST') {
      return handleAnalyze(env);
    }

    return new Response('Not Found', { status: 404 });
  }
};
