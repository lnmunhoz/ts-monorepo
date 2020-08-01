import express from "express"
import { ApolloServer } from "apollo-server-express"
import cors from "cors"
import faker from "faker"
import { CommonModule } from "@monorepo/common"
import { PrismaClient } from "@monorepo/db"
import { schema } from "@monorepo/graphql"

const app = express()
const PORT = process.env.PORT || 4000
const prisma = new PrismaClient()

const apollo = new ApolloServer({
   schema,
   context: () => ({ prisma }),
})

apollo.applyMiddleware({ app, cors: true })
app.use(cors())

prisma
   .connect()
   .then(() => console.log("prisma connected"))
   .catch((err) => console.log("prisma connection error"))

prisma.user
   .create({
      data: {
         email: faker.internet.email(),
      },
   })
   .then(() => console.log("user created"))
   .catch((err) => console.log("error creating user"))

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
