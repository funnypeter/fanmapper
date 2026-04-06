import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function gameRoutes(app: FastifyInstance) {
  // Get user's game library
  app.get('/library', { preHandler: authMiddleware }, async (request) => {
    const { data, error } = await supabase
      .from('user_games')
      .select('*, game:games(*)')
      .eq('user_id', request.userId!)
      .order('updated_at', { ascending: false });

    if (error) return { error: error.message };
    return data;
  });

  // Add game to library
  app.post('/library', { preHandler: authMiddleware }, async (request) => {
    const body = request.body as {
      game_id: string;
      status: string;
      platform?: string;
    };

    const { data, error } = await supabase
      .from('user_games')
      .upsert({
        user_id: request.userId!,
        game_id: body.game_id,
        status: body.status,
        platform: body.platform ?? null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { error: error.message };
    return data;
  });

  // Update game in library
  app.patch('/library/:gameId', { preHandler: authMiddleware }, async (request) => {
    const { gameId } = request.params as { gameId: string };
    const body = request.body as {
      status?: string;
      playtime_minutes?: number;
      rating?: number;
      review?: string;
      platform?: string;
    };

    const { data, error } = await supabase
      .from('user_games')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('user_id', request.userId!)
      .eq('game_id', gameId)
      .select()
      .single();

    if (error) return { error: error.message };
    return data;
  });

  // Remove game from library
  app.delete('/library/:gameId', { preHandler: authMiddleware }, async (request) => {
    const { gameId } = request.params as { gameId: string };

    const { error } = await supabase
      .from('user_games')
      .delete()
      .eq('user_id', request.userId!)
      .eq('game_id', gameId);

    if (error) return { error: error.message };
    return { success: true };
  });
}
