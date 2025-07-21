import { createClient } from '@libsql/client'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

// For local development, use file-based SQLite
// For production, use Turso's edge database
const getLibSQLClient = () => {
  if (process.env.NODE_ENV === 'production' && process.env.TURSO_DATABASE_URL) {
    // Production: Use Turso
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  } else {
    // Development: Use local file
    return createClient({
      url: 'file:./prisma/dev.db',
    })
  }
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  const libsql = getLibSQLClient()
  const adapter = new PrismaLibSQL(libsql)
  prisma = new PrismaClient({ adapter })
} else {
  // Development: Use standard Prisma client
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
  prisma = globalForPrisma.prisma
}

export { prisma }