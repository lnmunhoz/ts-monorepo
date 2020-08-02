import { bootstrap, prisma, logger } from "./server"

bootstrap("nexus")
   .then()
   .catch((err) => logger.error(err))

// Seed some data for testing, you can comment this out or delete.
// You can comment or delete this.
prisma
   .connect()
   .then(() => logger.debug("prisma connected"))
   .catch((err) => logger.debug("prisma connection error"))

prisma.user
   .create({
      data: {
         email: require("faker").internet.email(),
      },
   })
   .then(() => logger.debug("user created"))
   .catch((err) => logger.debug("error creating user"))
