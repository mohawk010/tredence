import { PrismaClient } from "@prisma/client";
import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Enable WebSocket connections for Neon if needed by standard config
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  // Use dummy string for generic builds, Neon adapter requires a valid-looking URI format
  const connectionString = process.env.DATABASE_URL || "postgres://dummy:dummy@localhost:5432/dummy";
  console.log("DB INIT CALLED. DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 10));
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);
  
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
