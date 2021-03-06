import { CommonModule, createLogger } from "@monorepo/common"
import { PrismaClient } from "@monorepo/db"
import { nexus, typegraphql } from "@monorepo/graphql"
import { ApolloServer } from "apollo-server-express"
import bodyParser from "body-parser"
import compression from "compression"
import cors from "cors"
import cuid from "cuid"
import express from "express"
import { GraphQLSchema } from "graphql"
import helmet from "helmet"
import { isProduction } from "./config"
import statusMonitor from "express-status-monitor"

const PORT = process.env.PORT || 4000
export const prisma = new PrismaClient()
export const logger = createLogger(isProduction)

let schemaCache: GraphQLSchema

// Choose what type of framework to use:
type framework = "nexus" | "typegraphql"

const initApolloServer = async (framework: framework) => {
   logger.info(`Framework selected: ${framework}`)

   if (!schemaCache) {
      // I am not sure if this is necessary, but is a good practice in aws-lambda
      logger.info("Generating schema and caching...")
      schemaCache =
         framework === "nexus"
            ? await nexus.getSchema()
            : await typegraphql.getSchema()

      // Add middlwrares if needed
      // graphqlMiddleware(schemaCache, ...middlewares)
   }

   return new ApolloServer({
      schema: schemaCache,
      context: ({ req, res }) => ({
         req,
         res,
         prisma,
         logger: logger.child({ label: "ctx" }),
      }),
   })
}

// Call this function with the desired framework
export const bootstrap = async (framework: framework) => {
   const app = express()
   const apollo = await initApolloServer(framework)

   app.use((req, res, next) => {
      // TransactionId, do something with this for tracing.
      const tid = cuid()
      logger.debug(`req:${tid}`)
      next()
   })

   app.use(cors())
   app.use(helmet())
   app.use(compression())
   app.use(express.json())
   app.use(bodyParser.urlencoded({ extended: true }))
   apollo.applyMiddleware({ app, cors: true })

   // Enable status monitor package (could not find the typings)
   const status = statusMonitor() as any
   app.use(status)
   app.get("/", status.pageRoute)

   app.get("/hello", (req, res) => {
      res.status(200).send(`${CommonModule}`)
   })

   app.get("/users/count", async (req, res) => {
      const usersCount = await prisma.user.count()
      res.status(200).send(`${usersCount}`)
   })

   app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`)
   })
}
