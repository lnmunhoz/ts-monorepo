import express from "express"
import faker from "faker"
import { CommonModule } from "@monorepo/common"
import { PrismaClient } from "@monorepo/db"

const app = express()
const PORT = process.env.PORT || 4000
const prisma = new PrismaClient()

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
