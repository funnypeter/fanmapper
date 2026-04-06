import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import { userRoutes } from './routes/users.js';
import { gameRoutes } from './routes/games.js';
import { syncRoutes } from './routes/sync.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

// Health check
app.get('/health', async () => ({ status: 'ok' }));

// Routes
await app.register(userRoutes, { prefix: '/api/users' });
await app.register(gameRoutes, { prefix: '/api/games' });
await app.register(syncRoutes, { prefix: '/api/sync' });

const port = Number(process.env.PORT) || 3001;
await app.listen({ port, host: '0.0.0.0' });
console.log(`Server running on port ${port}`);
