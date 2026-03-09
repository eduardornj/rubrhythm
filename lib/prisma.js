// C:\Users\eDuArDoXP\OneDrive\Documents\rubrhythm\lib\prisma.js
import { PrismaClient } from '../prisma/generated/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient({
      log: ['error'],
    });
  }
  prisma = globalThis.prisma;
}

// Note: Process event handlers removed to avoid Edge Runtime conflicts
// Prisma connections will be managed automatically by Next.js

export default prisma;