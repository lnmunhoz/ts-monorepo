import { CommonModule } from "@monorepo/common"
import { PrismaClient } from "@monorepo/db"
import { nexus, typegraphql } from "@monorepo/graphql"
import { ApolloServer } from "apollo-server-express"
import cors from "cors"
import express from "express"

const PORT = process.env.PORT || 4000
export const prisma = new PrismaClient()

// Choose what type of framework to use:
type framework = "nexus" | "typegraphql"

const initApolloServer = async (framework: framework) => {
   console.log("Framework selected:", framework)
   return new ApolloServer({
      schema:
         framework === "nexus"
            ? await nexus.getSchema()
            : await typegraphql.getSchema(),
      context: () => ({ prisma }),
   })
}

// Call this function with the desired framework
export const bootstrap = async (framework: framework) => {
   const app = express()

   const apollo = await initApolloServer(framework)
   apollo.applyMiddleware({ app, cors: true })

   app.use(cors())

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
