import { bootstrap, prisma } from "./server"

bootstrap("nexus")
   .then()
   .catch((err) => console.log(err))

// Seed some data for testing, you can comment this out or delete.
// You can comment or delete this.
prisma
   .connect()
   .then(() => console.log("prisma connected"))
   .catch((err) => console.log("prisma connection error"))

prisma.user
   .create({
      data: {
         email: require("faker").internet.email(),
      },
   })
   .then(() => console.log("user created"))
   .catch((err) => console.log("error creating user"))
