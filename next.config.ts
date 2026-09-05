import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Packages that must stay external to the server bundle.
   *
   * These are all native or Node-only: `ws` and `ioredis` open sockets, `pg`
   * has a native binding path, and Prisma ships its own engine. Bundling any
   * of them either fails outright or produces a broken runtime.
   */
  serverExternalPackages: ['ws', 'ioredis', 'pg', '@prisma/adapter-pg', '@prisma/client'],
};

export default nextConfig;
