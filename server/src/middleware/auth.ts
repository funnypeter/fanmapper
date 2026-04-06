import type { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }

  request.userId = user.id;
}
