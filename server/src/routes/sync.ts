import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SyncItem {
  table: string;
  action: 'upsert' | 'delete';
  data: Record<string, unknown>;
}

export async function syncRoutes(app: FastifyInstance) {
  // Offline sync: client sends queued changes
  app.post('/push', { preHandler: authMiddleware }, async (request) => {
    const { items } = request.body as { items: SyncItem[] };
    const errors: string[] = [];

    for (const item of items) {
      try {
        if (item.action === 'upsert') {
          const { error } = await supabase
            .from(item.table)
            .upsert({ ...item.data, user_id: request.userId! });
          if (error) errors.push(`${item.table}: ${error.message}`);
        } else if (item.action === 'delete') {
          const { error } = await supabase
            .from(item.table)
            .delete()
            .match({ ...item.data, user_id: request.userId! });
          if (error) errors.push(`${item.table}: ${error.message}`);
        }
      } catch (err) {
        errors.push(`${item.table}: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }

    return { synced: items.length - errors.length, errors };
  });

  // Pull latest data for a table since a timestamp
  app.get('/pull', { preHandler: authMiddleware }, async (request) => {
    const { table, since } = request.query as { table: string; since?: string };

    let query = supabase
      .from(table)
      .select('*')
      .eq('user_id', request.userId!);

    if (since) {
      query = query.gte('updated_at', since);
    }

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data };
  });
}
