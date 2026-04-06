import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function userRoutes(app: FastifyInstance) {
  // Get current user profile
  app.get('/me', { preHandler: authMiddleware }, async (request) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', request.userId!)
      .single();

    if (error) return { error: error.message };
    return data;
  });

  // Update profile
  app.patch('/me', { preHandler: authMiddleware }, async (request) => {
    const body = request.body as { display_name?: string; avatar_url?: string };

    const { data, error } = await supabase
      .from('profiles')
      .update(body)
      .eq('id', request.userId!)
      .select()
      .single();

    if (error) return { error: error.message };
    return data;
  });
}
