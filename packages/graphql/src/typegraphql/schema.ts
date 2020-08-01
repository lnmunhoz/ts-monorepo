import {
   buildSchema,
   Ctx,
   Field,
   ID,
   ObjectType,
   Query,
   Resolver,
} from "type-graphql"
import { GraphQLContext } from "../context"

@ObjectType()
class User {
   @Field((type) => ID)
   id: string

   @Field()
   email: string
}

@Resolver()
class UserResolvers {
   @Query((returns) => [User])
   async users(@Ctx() ctx: GraphQLContext) {
      return ctx.prisma.user.findMany()
   }
}

export const getSchema = async () => {
   const schema = await buildSchema({
      resolvers: [UserResolvers],
   })

   return schema
}
