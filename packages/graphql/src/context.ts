import { PrismaClient } from "@monorepo/db"

export interface GraphQLContext {
   prisma: PrismaClient
}
