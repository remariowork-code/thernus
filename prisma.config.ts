import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 moves the migration connection URL out of schema.prisma. The
 * runtime client gets its connection through the pg driver adapter instead —
 * see src/lib/prisma.ts.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
