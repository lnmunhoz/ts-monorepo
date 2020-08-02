import { ILogger } from "@monorepo/common"
import { PrismaClient } from "@monorepo/db"
import { Request } from "express"

export interface GraphQLContext {
   prisma: PrismaClient
   logger: ILogger
   req: Request
   res: Request
}
