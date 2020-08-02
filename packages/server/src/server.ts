import { CommonModule } from "@monorepo/common"
import { PrismaClient } from "@monorepo/db"
import { nexus, typegraphql } from "@monorepo/graphql"
import { ApolloServer } from "apollo-server-express"
import bodyParser from "body-parser"
import compression from "compression"
import cors from "cors"
import express from "express"
import { GraphQLSchema } from "graphql"
import helmet from "helmet"

const PORT = process.env.PORT || 4000
export const prisma = new PrismaClient()

let schemaCache: GraphQLSchema

// Choose what type of framework to use:
type framework = "nexus" | "typegraphql"

const initApolloServer = async (framework: framework) => {
   console.log("Framework selected:", framework)

   if (!schemaCache) {
      // I am not sure if this is necessary, but is a good practice in aws-lambda
      console.log("Generating schema and caching...")
      schemaCache =
         framework === "nexus"
            ? await nexus.getSchema()
            : await typegraphql.getSchema()
   }

   return new ApolloServer({
      schema: schemaCache,
      context: () => ({ prisma }),
   })
}

// Call this function with the desired framework
export const bootstrap = async (framework: framework) => {
   const app = express()
   const apollo = await initApolloServer(framework)

   app.use(cors())
   app.use(helmet())
   app.use(compression())
   app.use(express.json())
   app.use(bodyParser.urlencoded({ extended: true }))
   apollo.applyMiddleware({ app, cors: true })

   app.get("/hello", (req, res) => {
      res.status(200).send(`${CommonModule}`)
   })

   app.get("/users/count", async (req, res) => {
      const usersCount = await prisma.user.count()
      res.status(200).send(`${usersCount}`)
   })

   app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
   })
}
