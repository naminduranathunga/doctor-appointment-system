import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // For Prisma 7, if using standard Postgres and NOT Prisma Accelerate,
  // we should just use the default constructor or pass datasources properly.
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
