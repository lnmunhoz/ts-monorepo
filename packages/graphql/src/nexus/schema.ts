import { CommonModule } from "@monorepo/common"
import {
   interfaceType,
   makeSchema,
   objectType,
   queryField,
   queryType,
} from "@nexus/schema"
import path from "path"

const Query = queryType({
   definition(t) {
      t.field("hello", {
         type: "Int",
         resolve: () => CommonModule,
      })
   },
})

const UserType = objectType({
   name: "User",
   definition(t) {
      t.int("id")
      t.string("email", { nullable: false })
   },
})

const usersQuery = queryField("users", {
   type: "User",
   list: true,
   resolve: async (self, args, ctx) => {
      const users = await ctx.prisma.user.findMany()
      return users
   },
})

const NEXUS_DEV = process.env.NEXUS_DEV

if (NEXUS_DEV) {
   console.log("Compiling nexus in watch mode...")
}

const schema = makeSchema({
   types: [Query, UserType, usersQuery],
   outputs: NEXUS_DEV
      ? {
           typegen: path.join(__dirname, "./generated/types.d.ts"),
        }
      : false,
   typegenAutoConfig: {
      sources: [
         {
            source: process.env.NEXUS_DEV
               ? path.join(__dirname, "../src/context.ts")
               : path.join(__dirname, "../../src/context.ts"),
            alias: "ctx",
         },
      ],
      contextType: "ctx.GraphQLContext",
   },
})

export const getSchema = async () => {
   return schema
}
